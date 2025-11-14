import mongoose from "mongoose"

const OBEConfigSchema = new mongoose.Schema(
  {
    gradeThresholds: {
      A: { type: Number, default: 90, min: 0, max: 100 },
      B: { type: Number, default: 80, min: 0, max: 100 },
      C: { type: Number, default: 70, min: 0, max: 100 },
      D: { type: Number, default: 60, min: 0, max: 100 },
      F: { type: Number, default: 0, min: 0, max: 100 },
    },
    passPercentage: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    gradingScale: {
      type: String,
      enum: ["Percentage", "Letter", "GPA"],
      default: "Percentage",
    },
    program: {
      type: String,
      default: "BS Computer Science",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.OBEConfig || mongoose.model("OBEConfig", OBEConfigSchema)
