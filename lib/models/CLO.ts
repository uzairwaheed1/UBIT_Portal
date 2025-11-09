import mongoose from "mongoose"

const CLOSchema = new mongoose.Schema(
  {
    cloId: {
      type: String,
      required: true,
      unique: true,
    },
    cloName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    linkedPLO: {
      type: String,
      required: true,
      ref: "PLO",
    },
    course: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.CLO || mongoose.model("CLO", CLOSchema)