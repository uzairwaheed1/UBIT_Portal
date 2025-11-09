import mongoose, { Document, Schema } from "mongoose";

export interface ISemester extends Document {
  semesterId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

const SemesterSchema: Schema = new Schema(
  {
    semesterId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Semester || mongoose.model<ISemester>("Semester", SemesterSchema);