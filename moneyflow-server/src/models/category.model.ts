import mongoose, { Schema, Document } from "mongoose";

export enum CategoryType {
  INCOME = "income",
  EXPENSE = "expense",
}

export interface ICategory extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
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

    name: { type: String, required: true },

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
