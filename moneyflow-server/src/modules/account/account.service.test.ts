import mongoose from "mongoose";
import {
  createAccountService,
  deleteAccountService,
  getAccountByIdService,
  getAccountsService,
  settleAccountService,
  settleDueSavingsForAllUsers,
  settleDueSavingsForUser,
  updateAccountService,
} from "./account.service";
import AccountModel, { AccountStatus, AccountType } from "./account.model";
import CategoryModel from "../category/category.model";
import TransactionModel, { TransactionType } from "../transaction/transaction.model";

jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    startSession: jest.fn(),
  },
}));

jest.mock("./account.model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  },
  AccountType: {
    CASH: "cash",
    BANK: "bank",
    EWALLET: "ewallet",
    CREDIT: "credit",
    SAVING: "saving",
  },
  AccountStatus: {
    ACTIVE: "active",
    SETTLED: "settled",
  },
}));

jest.mock("../category/category.model", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  CategoryType: {
    INCOME: "income",
    EXPENSE: "expense",
    TRANSFER: "transfer",
  },
}));

jest.mock("../transaction/transaction.model", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    deleteMany: jest.fn(),
  },
  TransactionType: {
    INCOME: "income",
    EXPENSE: "expense",
    TRANSFER: "transfer",
  },
}));

type SessionMock = {
  startTransaction: jest.Mock;
  commitTransaction: jest.Mock;
  abortTransaction: jest.Mock;
  endSession: jest.Mock;
};

const makeSession = (): SessionMock => ({
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn(),
});

const makeChainableQuery = (result: any) => ({
  session: jest.fn().mockResolvedValue(result),
  sort: jest.fn().mockReturnThis(),
  select: jest.fn().mockResolvedValue(result),
});

describe("account.service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (CategoryModel.findOne as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue({ _id: "cat-default" }),
    });
  });

  it("createAccountService creates normal account with initial balance transaction", async () => {
    const session = makeSession();
    (mongoose.startSession as jest.Mock).mockResolvedValue(session);

    const accountDoc = {
      _id: "acc-1",
      balance: 0,
      currencyCode: "VND",
      save: jest.fn().mockResolvedValue(undefined),
    };
    (AccountModel.create as jest.Mock).mockResolvedValue([accountDoc]);

    (CategoryModel.findOne as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(null),
    });
    (CategoryModel.create as jest.Mock).mockResolvedValue([{ _id: "cat-1" }]);

    await createAccountService("user-1", {
      name: "Wallet",
      type: AccountType.CASH,
      balance: 1000,
    });

    expect(AccountModel.create).toHaveBeenCalled();
    expect(CategoryModel.create).toHaveBeenCalled();
    expect(TransactionModel.create).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          accountId: "acc-1",
          amount: 1000,
          type: TransactionType.INCOME,
          isInitialBalance: true,
        }),
      ]),
      { session },
    );
    expect(accountDoc.save).toHaveBeenCalledWith({ session });
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });

  it("createAccountService throws when saving source account not found", async () => {
    const session = makeSession();
    (mongoose.startSession as jest.Mock).mockResolvedValue(session);
    (AccountModel.create as jest.Mock).mockResolvedValue([
      { _id: "saving-1", currencyCode: "VND", save: jest.fn() },
    ]);
    (AccountModel.findOne as jest.Mock).mockReturnValue(
      makeChainableQuery(null),
    );

    await expect(
      createAccountService("user-1", {
        name: "Saving",
        type: AccountType.SAVING,
        balance: 500,
        sourceAccountId: "source-1",
      }),
    ).rejects.toThrow("SOURCE_ACCOUNT_NOT_FOUND");

    expect(session.abortTransaction).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });

  it("getAccountsService settles due savings then returns sorted accounts", async () => {
    const findResult = [{ _id: "acc-1" }];
    (AccountModel.find as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue([]),
      })
      .mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue(findResult),
      });

    const result = await getAccountsService("user-1");

    expect(AccountModel.find).toHaveBeenNthCalledWith(2, { userId: "user-1" });
    expect(result).toEqual(findResult);
  });

  it("getAccountByIdService settles due savings then returns account", async () => {
    const account = { _id: "acc-1" };
    (AccountModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    });
    (AccountModel.findOne as jest.Mock).mockResolvedValue(account);

    const result = await getAccountByIdService("user-1", "acc-1");

    expect(AccountModel.findOne).toHaveBeenCalledWith({
      _id: "acc-1",
      userId: "user-1",
    });
    expect(result).toBe(account);
  });

  it("updateAccountService returns null when account is missing", async () => {
    const session = makeSession();
    (mongoose.startSession as jest.Mock).mockResolvedValue(session);
    (AccountModel.findOne as jest.Mock).mockReturnValue(makeChainableQuery(null));

    const result = await updateAccountService("user-1", "acc-1", { name: "n" });

    expect(result).toBeNull();
    expect(session.abortTransaction).toHaveBeenCalled();
  });

  it("updateAccountService syncs initial balance when balance changes", async () => {
    const session = makeSession();
    (mongoose.startSession as jest.Mock).mockResolvedValue(session);

    const accountDoc: any = {
      _id: "acc-1",
      balance: 100,
      type: AccountType.CASH,
      currencyCode: "VND",
      save: jest.fn().mockResolvedValue(undefined),
    };
    (AccountModel.findOne as jest.Mock)
      .mockReturnValueOnce(makeChainableQuery(accountDoc))
      .mockReturnValueOnce(makeChainableQuery(null));

    (CategoryModel.findOne as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue({ _id: "cat-1" }),
    });
    (TransactionModel.findOne as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      session: jest.fn().mockResolvedValue(null),
    });

    await updateAccountService("user-1", "acc-1", { balance: 250 });

    expect(TransactionModel.create).toHaveBeenCalled();
    expect(accountDoc.save).toHaveBeenCalledWith({ session });
    expect(session.commitTransaction).toHaveBeenCalled();
  });

  it("deleteAccountService rolls back related transfers and deletes account transactions", async () => {
    const session = makeSession();
    (mongoose.startSession as jest.Mock).mockResolvedValue(session);
    const accountDoc = { deleteOne: jest.fn().mockResolvedValue(undefined) };
    const destinationAccount = {
      _id: "acc-2",
      balance: 500,
      save: jest.fn().mockResolvedValue(undefined),
    };
    (AccountModel.findOne as jest.Mock).mockReturnValue(
      makeChainableQuery(accountDoc),
    );
    (TransactionModel.find as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue([
        {
          accountId: "acc-1",
          amount: 100,
          toAccountId: "acc-2",
          type: TransactionType.TRANSFER,
        },
      ]),
    });
    (AccountModel.findOne as jest.Mock)
      .mockReturnValueOnce(makeChainableQuery(accountDoc))
      .mockReturnValueOnce(makeChainableQuery(destinationAccount));
    (TransactionModel.deleteMany as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(undefined),
    });

    const result = await deleteAccountService("user-1", "acc-1");

    expect(destinationAccount.balance).toBe(400);
    expect(destinationAccount.save).toHaveBeenCalledWith({ session });
    expect(TransactionModel.deleteMany).toHaveBeenCalledWith({
      userId: "user-1",
      $or: [{ accountId: "acc-1" }, { toAccountId: "acc-1" }],
    });
    expect(accountDoc.deleteOne).toHaveBeenCalledWith({ session });
    expect(result).toBe(accountDoc);
  });

  it("settleAccountService settles valid saving account", async () => {
    const session = makeSession();
    (mongoose.startSession as jest.Mock).mockResolvedValue(session);
    const savingDoc: any = {
      _id: "saving-1",
      type: AccountType.SAVING,
      status: AccountStatus.ACTIVE,
      balance: 1000,
      currencyCode: "VND",
      interestRate: 10,
      termMonths: 1,
      startDate: new Date("2025-01-01"),
      maturityDate: new Date("2025-02-01"),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const destinationDoc: any = {
      _id: "cash-1",
      type: AccountType.CASH,
      balance: 100,
      currencyCode: "VND",
      save: jest.fn().mockResolvedValue(undefined),
    };

    (AccountModel.findOne as jest.Mock)
      .mockReturnValueOnce(makeChainableQuery(savingDoc))
      .mockReturnValueOnce(makeChainableQuery(destinationDoc));

    await settleAccountService("user-1", "saving-1", {
      targetAccountId: "cash-1",
    });

    expect(destinationDoc.save).toHaveBeenCalledWith({ session });
    expect(savingDoc.save).toHaveBeenCalledWith({ session });
    expect(session.commitTransaction).toHaveBeenCalled();
  });

  it("settleAccountService throws for non-saving account", async () => {
    const session = makeSession();
    (mongoose.startSession as jest.Mock).mockResolvedValue(session);
    (AccountModel.findOne as jest.Mock).mockReturnValue(
      makeChainableQuery({
        _id: "acc-1",
        type: AccountType.CASH,
      }),
    );

    await expect(settleAccountService("user-1", "acc-1")).rejects.toThrow(
      "SAVING_ACCOUNT_NOT_FOUND",
    );
    expect(session.abortTransaction).toHaveBeenCalled();
  });

  it("settleDueSavingsForUser processes each due saving account", async () => {
    const session = makeSession();
    (mongoose.startSession as jest.Mock).mockResolvedValue(session);
    (AccountModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue([
        {
          _id: "saving-1",
          maturityDate: new Date("2025-02-01"),
        },
      ]),
    });

    (AccountModel.findOne as jest.Mock)
      .mockReturnValueOnce(
        makeChainableQuery({
          _id: "saving-1",
          type: AccountType.SAVING,
          status: AccountStatus.ACTIVE,
          balance: 1000,
          currencyCode: "VND",
          interestRate: 10,
          termMonths: 1,
          startDate: new Date("2025-01-01"),
          maturityDate: new Date("2025-02-01"),
          save: jest.fn().mockResolvedValue(undefined),
        }),
      )
      .mockReturnValueOnce(
        makeChainableQuery({
          _id: "cash-1",
          type: AccountType.CASH,
          balance: 0,
          currencyCode: "VND",
          save: jest.fn().mockResolvedValue(undefined),
        }),
      );

    await settleDueSavingsForUser("user-1");

    expect(AccountModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        type: AccountType.SAVING,
        status: AccountStatus.ACTIVE,
      }),
    );
  });

  it("settleDueSavingsForAllUsers processes due savings globally", async () => {
    (AccountModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    });

    await settleDueSavingsForAllUsers();

    expect(AccountModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        type: AccountType.SAVING,
        status: AccountStatus.ACTIVE,
      }),
    );
  });
});
