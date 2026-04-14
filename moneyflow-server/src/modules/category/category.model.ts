import mongoose, { Schema, Document } from "mongoose";
import { LocalizedText, localizedTextSchema } from "../../shared/localized";

export enum CategoryType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
}

export interface ICategory extends Document {
  userId?: mongoose.Types.ObjectId;
  name: LocalizedText;
  type: CategoryType;
  icon?: string;
  color?: string;
  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: localizedTextSchema, required: true },

    type: {
      type: String,
      enum: Object.values(CategoryType),
      required: true,
    },

    icon: String,
    color: String,

    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<ICategory>("Category", CategorySchema);
