import { Schema, model, Document, Types } from "mongoose";

export interface IStock extends Document {
  userId: Types.ObjectId;
  symbol: string;
  quantity: number;
  buyPrice: number;
  buyDate: Date;
}

const stockSchema = new Schema<IStock>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    quantity: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
    buyDate: { type: Date, required: true },
  },
  { timestamps: true },
);

export const StockModel = model<IStock>("Stock", stockSchema);
