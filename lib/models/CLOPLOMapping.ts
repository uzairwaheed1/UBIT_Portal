import mongoose from "mongoose"

const CLOPLOMappingSchema = new mongoose.Schema(
  {
    cloId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CLO",
      required: true,
    },
    ploId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PLO",
      required: true,
    },
    strength: {
      type: String,
      enum: ["Strong", "Moderate", "Weak"],
      default: "Moderate",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.CLOPLOMapping || mongoose.model("CLOPLOMapping", CLOPLOMappingSchema)

