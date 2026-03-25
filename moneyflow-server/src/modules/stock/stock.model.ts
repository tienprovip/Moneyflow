import mongoose, { Schema, Document } from "mongoose";
import { CurrencyCode } from "../../shared/currency";

export interface IStock extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  quantity: number;
  buyPrice: number;
  currencyCode: CurrencyCode;
  buyDate: Date;

  createdAt: Date;
  updatedAt: Date;
}

const StockSchema = new Schema<IStock>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    quantity: { type: Number, required: true },

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

export default mongoose.model<IStock>("Stock", StockSchema);
