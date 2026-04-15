import mongoose from "mongoose";
import AccountModel, { AccountStatus, AccountType } from "./account.model";
import CategoryModel, { CategoryType } from "../category/category.model";
import TransactionModel, {
  ITransaction,
  TransactionType,
} from "../transaction/transaction.model";
import { CurrencyCode } from "../../shared/currency";

const INITIAL_BALANCE_CATEGORY_CONFIG = {
  [TransactionType.INCOME]: {
    categoryType: CategoryType.INCOME,
    color: "bg-slate-100 text-slate-700",
    icon: "Banknote",
    name: {
      en: "Other income",
      vi: "Thu nhap khac",
    },
  },
  [TransactionType.EXPENSE]: {
    categoryType: CategoryType.EXPENSE,
    color: "bg-amber-100 text-amber-700",
    icon: "Receipt",
    name: {
      en: "Other expense",
      vi: "Chi phi khac",
    },
  },
} as const;

const INITIAL_BALANCE_TITLE = "Số dư ban đầu";
const SAVING_DEPOSIT_TRANSFER_TITLE = "Saving deposit";
const SAVING_SETTLEMENT_TRANSFER_TITLE = "Saving settlement";
const SAVING_INTEREST_TITLE = "Saving interest";
const NON_TERM_INTEREST_RATE_PERCENT = 0.1;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getTransactionTypeByAmount = (amount: number) =>
  amount < 0 ? TransactionType.EXPENSE : TransactionType.INCOME;

const getSignedTransactionAmount = (transaction: ITransaction) =>
  transaction.type === TransactionType.EXPENSE
    ? -transaction.amount
    : transaction.amount;

const toDateOrNow = (value: unknown) => {
  if (!value) return new Date();
  const raw = String(value);
  const dateOnlyMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const toStartOfDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);

  return normalized;
};

const getDayDifference = (startDate: Date, endDate: Date) => {
  const start = toStartOfDay(startDate).getTime();
  const end = toStartOfDay(endDate).getTime();

  if (end <= start) return 0;

  return Math.floor((end - start) / MS_PER_DAY);
};

const calculateMaturityDate = (startDate: Date, termMonths: number) => {
  const maturityDate = new Date(startDate);
  maturityDate.setMonth(maturityDate.getMonth() + termMonths);
  return maturityDate;
};

const calculateSimpleInterest = ({
  principal,
  annualRatePercent,
  startDate,
  settlementDate,
}: {
  principal: number;
  annualRatePercent: number;
  startDate: Date;
  settlementDate: Date;
}) => {
  const holdingDays = getDayDifference(startDate, settlementDate);
  const interest =
    principal * (annualRatePercent / 100) * (holdingDays / 365);
  const roundedInterest = Math.max(0, Math.round(interest));

  return {
    holdingDays,
    interest: roundedInterest,
    totalReceived: Math.max(0, principal + roundedInterest),
  };
};

const findOrCreateInitialBalanceCategory = async (
  userId: string,
  session: mongoose.ClientSession,
  transactionType: TransactionType.INCOME | TransactionType.EXPENSE,
) => {
  const config = INITIAL_BALANCE_CATEGORY_CONFIG[transactionType];

  const existingCategory = await CategoryModel.findOne({
    type: config.categoryType,
    $and: [
      { $or: [{ userId }, { isDefault: true }] },
      {
        $or: [{ "name.en": config.name.en }, { "name.vi": config.name.vi }],
      },
    ],
  }).session(session);

  if (existingCategory) {
    return existingCategory;
  }

  const [createdCategory] = await CategoryModel.create(
    [
      {
        userId,
        color: config.color,
        icon: config.icon,
        isDefault: false,
        name: config.name,
        type: config.categoryType,
      },
    ],
    { session },
  );

  return createdCategory;
};

const findInitialBalanceTransaction = async (
  userId: string,
  accountId: string,
  session: mongoose.ClientSession,
) =>
  TransactionModel.findOne({
    accountId,
    userId,
    $or: [
      { isInitialBalance: true },
      {
        $and: [{ title: INITIAL_BALANCE_TITLE }, { note: INITIAL_BALANCE_TITLE }],
      },
    ],
  })
    .sort({ createdAt: 1, date: 1 })
    .session(session);

const syncInitialBalanceTransaction = async ({
  account,
  nextBalance,
  session,
  userId,
}: {
  account: InstanceType<typeof AccountModel>;
  nextBalance: number;
  session: mongoose.ClientSession;
  userId: string;
}) => {
  const initialTransaction = await findInitialBalanceTransaction(
    userId,
    String(account._id),
    session,
  );
  const currentBalance = Number(account.balance ?? 0);
  const currentInitialContribution = initialTransaction
    ? getSignedTransactionAmount(initialTransaction)
    : 0;
  const otherTransactionsContribution =
    currentBalance - currentInitialContribution;
  const nextInitialContribution = nextBalance - otherTransactionsContribution;

  if (nextInitialContribution === 0) {
    if (initialTransaction) {
      await initialTransaction.deleteOne({ session });
    }

    account.balance = nextBalance;
    await account.save({ session });
    return;
  }

  const nextTransactionType = getTransactionTypeByAmount(nextInitialContribution);
  const nextAmount = Math.abs(nextInitialContribution);
  const nextCategory = await findOrCreateInitialBalanceCategory(
    userId,
    session,
    nextTransactionType,
  );

  if (initialTransaction) {
    initialTransaction.amount = nextAmount;
    initialTransaction.categoryId = nextCategory._id;
    initialTransaction.currencyCode = account.currencyCode;
    initialTransaction.isInitialBalance = true;
    initialTransaction.note = INITIAL_BALANCE_TITLE;
    initialTransaction.title = INITIAL_BALANCE_TITLE;
    initialTransaction.type = nextTransactionType;
    await initialTransaction.save({ session });
  } else {
    await TransactionModel.create(
      [
        {
          accountId: account._id,
          amount: nextAmount,
          categoryId: nextCategory._id,
          currencyCode: account.currencyCode,
          date: new Date(),
          isInitialBalance: true,
          note: INITIAL_BALANCE_TITLE,
          title: INITIAL_BALANCE_TITLE,
          type: nextTransactionType,
          userId,
        },
      ],
      { session },
    );
  }

  account.balance = nextBalance;
  await account.save({ session });
};

type SettleAccountOptions = {
  targetAccountId?: string;
  settlementDate?: Date;
  autoSelectDestination?: boolean;
};

const resolveSettlementAccount = async ({
  account,
  session,
  targetAccountId,
  userId,
  autoSelectDestination,
}: {
  account: InstanceType<typeof AccountModel>;
  session: mongoose.ClientSession;
  targetAccountId?: string;
  userId: string;
  autoSelectDestination?: boolean;
}) => {
  const candidateIds = new Set<string>();
  const accountId = String(account._id);

  if (account.sourceAccountId) {
    candidateIds.add(String(account.sourceAccountId));
  }

  if (targetAccountId) {
    candidateIds.add(String(targetAccountId));
  }

  for (const candidateId of candidateIds) {
    if (!candidateId || candidateId === accountId) {
      continue;
    }

    const candidate = await AccountModel.findOne({
      _id: candidateId,
      userId,
    }).session(session);

    if (!candidate || candidate.type === AccountType.SAVING) {
      continue;
    }

    return candidate;
  }

  if (autoSelectDestination) {
    const fallbackCash = await AccountModel.findOne({
      userId,
      type: AccountType.CASH,
      _id: { $ne: account._id },
    })
      .sort({ updatedAt: -1 })
      .session(session);

    if (fallbackCash) {
      return fallbackCash;
    }

    const fallback = await AccountModel.findOne({
      userId,
      type: { $ne: AccountType.SAVING },
      _id: { $ne: account._id },
    })
      .sort({ updatedAt: -1 })
      .session(session);

    if (fallback) {
      return fallback;
    }
  }

  if (targetAccountId || account.sourceAccountId) {
    throw new Error("SETTLEMENT_ACCOUNT_INVALID");
  }

  throw new Error("SETTLEMENT_ACCOUNT_REQUIRED");
};

const settleSavingAccountInSession = async ({
  account,
  options,
  session,
  userId,
}: {
  account: InstanceType<typeof AccountModel>;
  options?: SettleAccountOptions;
  session: mongoose.ClientSession;
  userId: string;
}) => {
  if (account.type !== AccountType.SAVING) {
    throw new Error("SAVING_ACCOUNT_NOT_FOUND");
  }

  if (account.status === AccountStatus.SETTLED) {
    throw new Error("ACCOUNT_ALREADY_SETTLED");
  }

  const principal = Math.max(0, Math.round(Number(account.balance ?? 0)));
  const startDate = toDateOrNow(account.startDate ?? account.createdAt);
  const maturityDate = account.maturityDate
    ? new Date(account.maturityDate)
    : calculateMaturityDate(startDate, Number(account.termMonths ?? 0));
  const requestedSettlementDate = options?.settlementDate
    ? toDateOrNow(options.settlementDate)
    : new Date();
  const isEarlySettlement = requestedSettlementDate < maturityDate;
  const settlementDate = isEarlySettlement
    ? requestedSettlementDate
    : maturityDate;
  const annualRatePercent = isEarlySettlement
    ? NON_TERM_INTEREST_RATE_PERCENT
    : Number(account.interestRate ?? 0);
  const { interest, totalReceived } = calculateSimpleInterest({
    principal,
    annualRatePercent,
    settlementDate,
    startDate,
  });

  const destinationAccount = await resolveSettlementAccount({
    account,
    autoSelectDestination: options?.autoSelectDestination,
    session,
    targetAccountId: options?.targetAccountId,
    userId,
  });

  destinationAccount.balance =
    Number(destinationAccount.balance ?? 0) + totalReceived;
  await destinationAccount.save({ session });

  if (principal > 0) {
    await TransactionModel.create(
      [
        {
          accountId: account._id,
          amount: principal,
          currencyCode: account.currencyCode,
          date: settlementDate,
          note: SAVING_SETTLEMENT_TRANSFER_TITLE,
          title: SAVING_SETTLEMENT_TRANSFER_TITLE,
          toAccountId: destinationAccount._id,
          type: TransactionType.TRANSFER,
          userId,
        },
      ],
      { session },
    );
  }

  if (interest > 0) {
    const incomeCategory = await findOrCreateInitialBalanceCategory(
      userId,
      session,
      TransactionType.INCOME,
    );

    await TransactionModel.create(
      [
        {
          accountId: destinationAccount._id,
          amount: interest,
          categoryId: incomeCategory._id,
          currencyCode: destinationAccount.currencyCode,
          date: settlementDate,
          isSavingInterest: true,
          note: SAVING_INTEREST_TITLE,
          title: SAVING_INTEREST_TITLE,
          type: TransactionType.INCOME,
          userId,
        },
      ],
      { session },
    );
  }

  account.balance = 0;
  account.settledAmount = totalReceived;
  account.settledAt = settlementDate;
  account.settledInterest = interest;
  account.settlementAccountId = destinationAccount._id;
  account.status = AccountStatus.SETTLED;
  await account.save({ session });

  return account;
};

export const settleDueSavingsForUser = async (userId: string) => {
  const today = toStartOfDay(new Date());
  const dueSavings = await AccountModel.find({
    userId,
    type: AccountType.SAVING,
    status: AccountStatus.ACTIVE,
    maturityDate: { $lte: today },
  }).select("_id maturityDate");

  for (const saving of dueSavings) {
    try {
      await settleAccountService(userId, String(saving._id), {
        autoSelectDestination: true,
        settlementDate: saving.maturityDate
          ? new Date(saving.maturityDate)
          : today,
      });
    } catch (error) {
      console.error("AUTO SETTLE SAVING ERROR:", error);
    }
  }
};

export const settleDueSavingsForAllUsers = async () => {
  const today = toStartOfDay(new Date());
  const dueSavings = await AccountModel.find({
    type: AccountType.SAVING,
    status: AccountStatus.ACTIVE,
    maturityDate: { $lte: today },
  }).select("_id userId maturityDate");

  for (const saving of dueSavings) {
    try {
      await settleAccountService(String(saving.userId), String(saving._id), {
        autoSelectDestination: true,
        settlementDate: saving.maturityDate
          ? new Date(saving.maturityDate)
          : today,
      });
    } catch (error) {
      console.error("AUTO SETTLE SAVING ERROR:", error);
    }
  }
};

export const createAccountService = async (userId: string, data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const initialBalance = Number(data.balance ?? 0);
    const normalizedInitialBalance = Number.isFinite(initialBalance)
      ? initialBalance
      : 0;
    const shouldCreateInitialBalanceTransaction = normalizedInitialBalance !== 0;
    const startDate = toDateOrNow(data.startDate);
    const savingInitialAmount = Number(data.initialAmount ?? normalizedInitialBalance);

    const accountData: Record<string, unknown> = {
      balance: shouldCreateInitialBalanceTransaction
        ? 0
        : normalizedInitialBalance,
      currencyCode: data.currencyCode ?? CurrencyCode.VND,
      name: data.name,
      type: data.type,
      userId,
    };

    if (data.type === AccountType.SAVING) {
      accountData.initialAmount = Number.isFinite(savingInitialAmount)
        ? savingInitialAmount
        : 0;
      accountData.interestRate = data.interestRate || 0;
      accountData.termMonths = data.termMonths || 0;
      accountData.startDate = startDate;
      accountData.sourceAccountId = data.sourceAccountId;
      accountData.status = data.status || AccountStatus.ACTIVE;
      accountData.maturityDate = calculateMaturityDate(
        startDate,
        Number(data.termMonths || 0),
      );
    }

    const [account] = await AccountModel.create([accountData], { session });

    if (shouldCreateInitialBalanceTransaction) {
      if (data.type === AccountType.SAVING && data.sourceAccountId) {
        const sourceAccount = await AccountModel.findOne({
          _id: data.sourceAccountId,
          userId,
        }).session(session);

        if (!sourceAccount) {
          throw new Error("SOURCE_ACCOUNT_NOT_FOUND");
        }

        if (sourceAccount.type === AccountType.SAVING) {
          throw new Error("INVALID_SOURCE_ACCOUNT");
        }

        if (Number(sourceAccount.balance ?? 0) < normalizedInitialBalance) {
          throw new Error("INSUFFICIENT_SOURCE_BALANCE");
        }

        sourceAccount.balance -= normalizedInitialBalance;
        await sourceAccount.save({ session });

        await TransactionModel.create(
          [
            {
              accountId: sourceAccount._id,
              amount: normalizedInitialBalance,
              currencyCode: account.currencyCode,
              date: startDate,
              isInitialBalance: true,
              note: SAVING_DEPOSIT_TRANSFER_TITLE,
              title: SAVING_DEPOSIT_TRANSFER_TITLE,
              toAccountId: account._id,
              type: TransactionType.TRANSFER,
              userId,
            },
          ],
          { session },
        );

        account.balance = normalizedInitialBalance;
        await account.save({ session });
      } else {
        const initialTransactionType = getTransactionTypeByAmount(
          normalizedInitialBalance,
        );
        const category = await findOrCreateInitialBalanceCategory(
          userId,
          session,
          initialTransactionType,
        );

        account.balance = normalizedInitialBalance;
        await account.save({ session });

        await TransactionModel.create(
          [
            {
              accountId: account._id,
              amount: Math.abs(normalizedInitialBalance),
              categoryId: category._id,
              currencyCode: account.currencyCode,
              date: new Date(),
              isInitialBalance: true,
              note: INITIAL_BALANCE_TITLE,
              title: INITIAL_BALANCE_TITLE,
              type: initialTransactionType,
              userId,
            },
          ],
          { session },
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    return account;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getAccountsService = async (userId: string) => {
  await settleDueSavingsForUser(userId);
  return AccountModel.find({ userId }).sort({ createdAt: -1 });
};

export const getAccountByIdService = async (
  userId: string,
  accountId: string,
) => {
  await settleDueSavingsForUser(userId);

  return AccountModel.findOne({
    _id: accountId,
    userId,
  });
};

export const updateAccountService = async (
  userId: string,
  accountId: string,
  data: any,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await AccountModel.findOne({
      _id: accountId,
      userId,
    }).session(session);

    if (!account) {
      await session.abortTransaction();
      session.endSession();
      return null;
    }

    const { balance: nextBalanceRaw, ...restData } = data;
    const hasBalanceUpdate =
      typeof nextBalanceRaw === "number" && Number.isFinite(nextBalanceRaw);

    if (account.type === AccountType.SAVING) {
      if (restData.startDate) {
        restData.startDate = toDateOrNow(restData.startDate);
      }

      if (
        typeof restData.termMonths === "number" ||
        restData.startDate ||
        restData.maturityDate
      ) {
        const startDate = restData.startDate
          ? new Date(restData.startDate)
          : toDateOrNow(account.startDate ?? account.createdAt);
        const termMonths =
          typeof restData.termMonths === "number"
            ? restData.termMonths
            : Number(account.termMonths ?? 0);
        restData.maturityDate = calculateMaturityDate(startDate, termMonths);
      }
    }

    Object.assign(account, restData);

    if (hasBalanceUpdate) {
      await syncInitialBalanceTransaction({
        account,
        nextBalance: nextBalanceRaw,
        session,
        userId,
      });
    } else {
      await account.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return account;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const deleteAccountService = async (
  userId: string,
  accountId: string,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await AccountModel.findOne({
      _id: accountId,
      userId,
    }).session(session);

    if (!account) {
      await session.abortTransaction();
      session.endSession();
      return null;
    }

    await TransactionModel.deleteMany({
      accountId,
      userId,
    }).session(session);

    await account.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return account;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const settleAccountService = async (
  userId: string,
  accountId: string,
  options?: SettleAccountOptions,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await AccountModel.findOne({
      _id: accountId,
      userId,
    }).session(session);

    if (!account || account.type !== AccountType.SAVING) {
      throw new Error("SAVING_ACCOUNT_NOT_FOUND");
    }

    const settledAccount = await settleSavingAccountInSession({
      account,
      options,
      session,
      userId,
    });

    await session.commitTransaction();
    session.endSession();

    return settledAccount;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
