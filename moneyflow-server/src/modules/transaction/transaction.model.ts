import mongoose, { Schema, Document } from "mongoose";

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;

  type: TransactionType;
  amount: number;
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

    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },

    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },

    amount: { type: Number, required: true, min: 0 },

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
