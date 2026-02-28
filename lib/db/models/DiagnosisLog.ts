import mongoose, { Schema, Document } from "mongoose";

export interface IDiagnosisLog extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  symptoms: string;
  aiResponse: Record<string, unknown> | null;
  riskLevel: string | null;
  createdAt: Date;
}

const DiagnosisLogSchema = new Schema<IDiagnosisLog>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  symptoms: { type: String, required: [true, "Symptoms are required"] },
  aiResponse: { type: Schema.Types.Mixed, default: null },
  riskLevel: {
    type: String,
    enum: ["Low", "Medium", "High", null],
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.DiagnosisLog ||
  mongoose.model<IDiagnosisLog>("DiagnosisLog", DiagnosisLogSchema);
