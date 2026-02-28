import mongoose, { Schema, Document } from "mongoose";
import { ROLES, SUBSCRIPTION_PLANS } from "@/lib/constants";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  subscriptionPlan: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: [true, "Password is required"] },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, "Role is required"],
    },
    subscriptionPlan: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PLANS),
      default: SUBSCRIPTION_PLANS.FREE,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
