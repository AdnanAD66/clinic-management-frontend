import mongoose, { Schema, Document } from "mongoose";

export interface IMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface IPrescription extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  medicines: IMedicine[];
  instructions: string;
  aiExplanation: string;
  createdAt: Date;
}

const MedicineSchema = new Schema<IMedicine>(
  {
    name: { type: String, required: [true, "Medicine name is required"] },
    dosage: { type: String, required: [true, "Dosage is required"] },
    frequency: { type: String, required: [true, "Frequency is required"] },
    duration: { type: String, required: [true, "Duration is required"] },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: [true, "Patient ID is required"],
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Doctor ID is required"],
  },
  medicines: {
    type: [MedicineSchema],
    validate: {
      validator: (v: IMedicine[]) => v.length > 0,
      message: "At least one medicine is required",
    },
  },
  instructions: { type: String, default: "" },
  aiExplanation: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Prescription ||
  mongoose.model<IPrescription>("Prescription", PrescriptionSchema);
