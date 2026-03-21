import mongoose, { Schema, Document } from "mongoose";

export enum AccountType {
  WALLET = "wallet",
  BANK = "bank",
  SAVING = "saving",
}

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: AccountType;

  balance: number;

  // Saving
  initialAmount?: number;
  interestRate?: number;
  termMonths?: number;
  startDate?: Date;
  maturityDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: { type: String, required: true },

    type: {
      type: String,
      enum: Object.values(AccountType),
      required: true,
    },

    balance: { type: Number, default: 0 },

    // saving fields
    initialAmount: Number,
    interestRate: Number,
    termMonths: Number,
    startDate: Date,
    maturityDate: Date,
  },
  { timestamps: true },
);

export default mongoose.model<IAccount>("Account", AccountSchema);
