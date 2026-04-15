import mongoose, { Schema, Document } from "mongoose";
import { CurrencyCode } from "../../shared/currency";

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
}

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  toAccountId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;

  isInitialBalance?: boolean;
  isSavingInterest?: boolean;
  title?: string;
  type: TransactionType;
  amount: number;
  currencyCode: CurrencyCode;
  note?: string;
  date: Date;

  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    toAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      index: true,
    },

    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },

    isInitialBalance: { type: Boolean, default: false },
    isSavingInterest: { type: Boolean, default: false },

    title: String,

    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },

    amount: { type: Number, required: true, min: 0 },

    currencyCode: {
      type: String,
      enum: Object.values(CurrencyCode),
      default: CurrencyCode.VND,
    },
    note: String,

    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
