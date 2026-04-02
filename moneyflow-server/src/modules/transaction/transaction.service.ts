import mongoose from "mongoose";
import TransactionModel, { TransactionType } from "./transaction.model";
import AccountModel from "../account/account.model";
import type { z } from "zod";
import type { getSummaryQuerySchema } from "./transaction.validation";

type SummaryQuery = z.infer<typeof getSummaryQuerySchema>;

const getCurrentMonth = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const parseDateOnly = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const getMonthRange = (month?: string) => {
  const resolvedMonth = month ?? getCurrentMonth();
  const [year, monthIndex] = resolvedMonth.split("-").map(Number);

  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 1);

  return { start, end };
};

const getYearRange = (year: string) => {
  const yearNumber = Number(year);

  return {
    start: new Date(yearNumber, 0, 1),
    end: new Date(yearNumber + 1, 0, 1),
  };
};

const getCustomRange = (from: string, to: string) => {
  const start = parseDateOnly(from);
  const end = parseDateOnly(to);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

const getSummaryRange = (query: SummaryQuery) => {
  if (query.from && query.to) {
    return getCustomRange(query.from, query.to);
  }

  if (query.year) {
    return getYearRange(query.year);
  }

  return getMonthRange(query.month);
};

export const createTransactionService = async (userId: string, data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await AccountModel.findOne({
      _id: data.accountId,
      userId,
    }).session(session);

    if (!account) throw new Error("ACCOUNT_NOT_FOUND");

    if (
      data.type === TransactionType.EXPENSE &&
      account.balance < data.amount
    ) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    // update balance
    if (data.type === TransactionType.EXPENSE) {
      account.balance -= data.amount;
    } else {
      account.balance += data.amount;
    }

    await account.save({ session });

    const [transaction] = await TransactionModel.create(
      [
        {
          userId,
          ...data,
          date: data.date ? new Date(data.date) : new Date(),
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return transaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const updateTransactionService = async (
  userId: string,
  transactionId: string,
  data: any,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await TransactionModel.findOne({
      _id: transactionId,
      userId,
    }).session(session);

    if (!transaction) throw new Error("TRANSACTION_NOT_FOUND");

    const currentAccount = await AccountModel.findOne({
      _id: transaction.accountId,
      userId,
    }).session(session);

    if (!currentAccount) throw new Error("ACCOUNT_NOT_FOUND");

    const nextAccountId = String(data.accountId ?? transaction.accountId);
    const nextType = data.type ?? transaction.type;
    const nextAmount = data.amount ?? transaction.amount;

    const targetAccount =
      String(currentAccount._id) === nextAccountId
        ? currentAccount
        : await AccountModel.findOne({
            _id: nextAccountId,
            userId,
          }).session(session);

    if (!targetAccount) throw new Error("ACCOUNT_NOT_FOUND");

    // rollback old balance
    if (transaction.type === TransactionType.EXPENSE) {
      currentAccount.balance += transaction.amount;
    } else {
      currentAccount.balance -= transaction.amount;
    }

    // apply new
    if (nextType === TransactionType.EXPENSE) {
      if (targetAccount.balance < nextAmount) {
        throw new Error("INSUFFICIENT_BALANCE");
      }
      targetAccount.balance -= nextAmount;
    } else {
      targetAccount.balance += nextAmount;
    }

    await currentAccount.save({ session });

    if (String(currentAccount._id) !== String(targetAccount._id)) {
      await targetAccount.save({ session });
    }

    Object.assign(transaction, {
      ...data,
      date: data.date ? new Date(data.date) : transaction.date,
    });
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return transaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const deleteTransactionService = async (
  userId: string,
  transactionId: string,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await TransactionModel.findOne({
      _id: transactionId,
      userId,
    }).session(session);

    if (!transaction) throw new Error("TRANSACTION_NOT_FOUND");

    const account = await AccountModel.findOne({
      _id: transaction.accountId,
      userId,
    }).session(session);

    if (!account) throw new Error("ACCOUNT_NOT_FOUND");

    // rollback
    if (transaction.type === TransactionType.EXPENSE) {
      account.balance += transaction.amount;
    } else {
      account.balance -= transaction.amount;
    }

    await account.save({ session });

    await transaction.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getTransactionsService = async (userId: string, query: any) => {
  const filter: any = { userId };

  if (query.accountId) filter.accountId = query.accountId;
  if (query.type) filter.type = query.type;

  if (query.from && query.to) {
    filter.date = {
      $gte: new Date(query.from),
      $lte: new Date(query.to),
    };
  }

  return TransactionModel.find(filter).sort({ date: -1 });
};

export const getSummaryService = async (
  userId: string,
  query: SummaryQuery,
) => {
  const { start, end } = getSummaryRange(query);

  const summary = await TransactionModel.aggregate<{
    _id: TransactionType;
    total: number;
  }>([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const summaryMap = new Map(
    summary.map((item) => [item._id, item.total]),
  );

  return [TransactionType.INCOME, TransactionType.EXPENSE].map((type) => ({
    _id: type,
    total: summaryMap.get(type) ?? 0,
  }));
};
