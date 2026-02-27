import { Schema, model, Document, Types } from "mongoose";

export type TransactionType = "income" | "expense";

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  accountId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  category: string;
  date: Date;
  note?: string;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    note: { type: String },
  },
  { timestamps: true },
);

export const TransactionModel = model<ITransaction>(
  "Transaction",
  transactionSchema,
);
