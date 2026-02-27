import { Schema, model, Document, Types } from "mongoose";

export interface IGold extends Document {
  userId: Types.ObjectId;
  buyDate: Date;
  weight: number;
  buyPrice: number;
}

const goldSchema = new Schema<IGold>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyDate: { type: Date, required: true },
    weight: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
  },
  { timestamps: true },
);

export const GoldModel = model<IGold>("Gold", goldSchema);
