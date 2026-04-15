import mongoose, { Schema, Document } from "mongoose";
import { CurrencyCode } from "../../shared/currency";

export enum AccountType {
  CASH = "cash",
  BANK = "bank",
  EWALLET = "ewallet",
  CREDIT = "credit",
  SAVING = "saving",
}

export enum AccountStatus {
  ACTIVE = "active",
  SETTLED = "settled",
}

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: AccountType;
  currencyCode: CurrencyCode;

  balance: number;

  // Saving
  initialAmount?: number;
  sourceAccountId?: mongoose.Types.ObjectId;
  status?: AccountStatus;
  interestRate?: number;
  termMonths?: number;
  startDate?: Date;
  maturityDate?: Date;
  settledAmount?: number;
  settledInterest?: number;
  settledAt?: Date;
  settlementAccountId?: mongoose.Types.ObjectId;

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

    currencyCode: {
      type: String,
      enum: Object.values(CurrencyCode),
      default: CurrencyCode.VND,
    },

    balance: { type: Number, default: 0 },

    // saving fields
    initialAmount: Number,
    sourceAccountId: { type: Schema.Types.ObjectId, ref: "Account" },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.ACTIVE,
    },
    interestRate: Number,
    termMonths: Number,
    startDate: Date,
    maturityDate: Date,
    settledAmount: Number,
    settledInterest: Number,
    settledAt: Date,
    settlementAccountId: { type: Schema.Types.ObjectId, ref: "Account" },
  },
  { timestamps: true },
);

export default mongoose.model<IAccount>("Account", AccountSchema);
