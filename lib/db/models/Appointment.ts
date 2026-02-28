import mongoose, { Schema, Document } from "mongoose";
import { APPOINTMENT_STATUSES } from "@/lib/constants";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
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
    date: { type: Date, required: [true, "Date is required"] },
    timeSlot: { type: String, required: [true, "Time slot is required"] },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUSES),
      default: APPOINTMENT_STATUSES.PENDING,
    },
  },
  { timestamps: true }
);

// Prevent double-booking same doctor, date, time slot
AppointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: true });

export default mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);
