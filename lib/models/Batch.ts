import mongoose from "mongoose"

const BatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
    },
    batchName: {
      type: String,
      required: true,
    },
    yearOfAdmission: {
      type: Number,
      required: true,
    },
    program: {
      type: String,
      required: true,
      default: "BS Computer Science",
    },
    status: {
      type: String,
      enum: ["Active", "Graduated", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Batch || mongoose.model("Batch", BatchSchema)

