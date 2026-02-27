import { Schema, model, Document, Types } from "mongoose";

export interface ISavingDetail extends Document {
  accountId: Types.ObjectId;
  // money amount that the user has deposited in the saving account
  principal: number;
  // rate of interest per year (e.g., 5 for 5%)
  interestRate: number;
  durationMonths: number;
  startDate: Date;
}

const savingSchema = new Schema<ISavingDetail>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    principal: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    durationMonths: { type: Number, required: true },
    startDate: { type: Date, required: true },
  },
  { timestamps: true },
);

export const SavingModel = model<ISavingDetail>("SavingDetail", savingSchema);
