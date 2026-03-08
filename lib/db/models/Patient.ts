import mongoose, { Schema, Document } from "mongoose";

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: string;
  contact: string;
  userId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isRiskFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: [true, "Patient name is required"], trim: true },
    age: { type: Number, required: [true, "Age is required"], min: [0, "Age must be positive"] },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Other"],
    },
    contact: { type: String, required: [true, "Contact is required"], trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isRiskFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Patient ||
  mongoose.model<IPatient>("Patient", PatientSchema);
