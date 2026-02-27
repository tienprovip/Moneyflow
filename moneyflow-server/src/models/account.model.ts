import { Schema, model, Document, Types } from "mongoose";

export type AccountType = "wallet" | "bank" | "saving";

export interface IAccount extends Document {
  user: Types.ObjectId;
  name: string;
  type: AccountType;
  balance: number;
}

const accountSchema = new Schema<IAccount>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["wallet", "bank", "saving"], required: true },
    balance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export const AccountModel = model<IAccount>("Account", accountSchema);
