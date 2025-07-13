import mongoose from "mongoose"

const FeesSchema = new mongoose.Schema(
  {
    program: {
      type: String,
      required: true,
    },
    yearOfAdmission: {
      type: Number,
      required: true,
    },
    examFee: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    tuitionFee: {
      type: Number,
      default: 50000,
    },
    labFee: {
      type: Number,
      default: 5000,
    },
    libraryFee: {
      type: Number,
      default: 2000,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Fees || mongoose.model("Fees", FeesSchema)
