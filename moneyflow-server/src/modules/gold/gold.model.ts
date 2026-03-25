import mongoose, { Schema, Document } from "mongoose";
import { CurrencyCode } from "../../shared/currency";

export interface IGold extends Document {
  userId: mongoose.Types.ObjectId;
  weight: number;
  buyPrice: number;
  currencyCode: CurrencyCode;
  buyDate: Date;

  createdAt: Date;
  updatedAt: Date;
}

const GoldSchema = new Schema<IGold>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    weight: { type: Number, required: true },

    buyPrice: { type: Number, required: true },

    currencyCode: {
      type: String,
      enum: Object.values(CurrencyCode),
      default: CurrencyCode.VND,
    },

    buyDate: { type: Date, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IGold>("Gold", GoldSchema);
