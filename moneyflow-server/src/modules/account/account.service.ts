import mongoose from "mongoose";
import AccountModel, { AccountType, AccountStatus } from "./account.model";
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
      vi: "Thu nhập khác",
    },
  },
  [TransactionType.EXPENSE]: {
    categoryType: CategoryType.EXPENSE,
    color: "bg-amber-100 text-amber-700",
    icon: "Receipt",
    name: {
      en: "Other expense",
      vi: "Chi phí khác",
    },
  },
} as const;

const INITIAL_BALANCE_TITLE = "Số dư ban đầu";

const getTransactionTypeByAmount = (amount: number) =>
  amount < 0 ? TransactionType.EXPENSE : TransactionType.INCOME;

const getSignedTransactionAmount = (transaction: ITransaction) =>
  transaction.type === TransactionType.EXPENSE
    ? -transaction.amount
    : transaction.amount;

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
        $and: [
          { title: INITIAL_BALANCE_TITLE },
          { note: INITIAL_BALANCE_TITLE },
        ],
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

export const createAccountService = async (userId: string, data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const initialBalance = Number(data.balance ?? 0);
    const normalizedInitialBalance = Number.isFinite(initialBalance)
      ? initialBalance
      : 0;
    const shouldCreateInitialBalanceTransaction = normalizedInitialBalance !== 0;

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
      accountData.initialAmount = data.initialAmount || 0;
      accountData.interestRate = data.interestRate || 0;
      accountData.termMonths = data.termMonths || 0;
      accountData.startDate = data.startDate ? new Date(data.startDate) : new Date();
      accountData.sourceAccountId = data.sourceAccountId;
      accountData.status = data.status || AccountStatus.ACTIVE;

      if (data.termMonths) {
        const maturityDate = new Date(accountData.startDate as Date);
        maturityDate.setMonth(maturityDate.getMonth() + data.termMonths);
        accountData.maturityDate = maturityDate;
      }
    }

    const [account] = await AccountModel.create([accountData], { session });

    if (shouldCreateInitialBalanceTransaction) {
      if (data.type === AccountType.SAVING && data.sourceAccountId) {
        const sourceAccount = await AccountModel.findById(data.sourceAccountId).session(session);
        if (!sourceAccount) throw new Error("Source account not found");
        
        sourceAccount.balance -= normalizedInitialBalance;
        await sourceAccount.save({ session });

        await TransactionModel.create([{
          accountId: sourceAccount._id,
          toAccountId: account._id,
          amount: normalizedInitialBalance,
          currencyCode: account.currencyCode,
          date: accountData.startDate as Date,
          isInitialBalance: true,
          note: "Gửi tiết kiệm",
          title: "Gửi tiết kiệm",
          type: TransactionType.TRANSFER,
          userId,
        }], { session });

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
  return await AccountModel.find({ userId }).sort({ createdAt: -1 });
};

export const getAccountByIdService = async (
  userId: string,
  accountId: string,
) => {
  return await AccountModel.findOne({
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

export const settleAccountService = async (userId: string, accountId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await AccountModel.findOne({ _id: accountId, userId }).session(session);
    if (!account || account.type !== AccountType.SAVING) {
      throw new Error("Saving account not found or not a saving account");
    }
    
    if (account.status === "settled") {
      throw new Error("Account already settled");
    }

    const currentBalance = account.balance || 0;

    if (account.sourceAccountId) {
      const sourceAccount = await AccountModel.findById(account.sourceAccountId).session(session);
      if (sourceAccount) {
        sourceAccount.balance += currentBalance;
        await sourceAccount.save({ session });

        if (currentBalance > 0) {
          await TransactionModel.create([{
            accountId: account._id,
            toAccountId: sourceAccount._id,
            amount: currentBalance,
            currencyCode: account.currencyCode,
            date: new Date(),
            note: "Tất toán sổ tiết kiệm",
            title: "Tất toán sổ tiết kiệm",
            type: TransactionType.TRANSFER,
            userId,
          }], { session });
        }
      }
    }

    account.status = AccountStatus.SETTLED;
    account.balance = 0;
    await account.save({ session });

    await session.commitTransaction();
    session.endSession();

    return account;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
