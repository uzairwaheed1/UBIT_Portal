import mongoose from "mongoose"

const PLOSchema = new mongoose.Schema(
  {
    ploId: {
      type: String,
      required: true,
      unique: true,
    },
    ploName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    linkedPEO: {
      type: String,
      required: true,
      ref: "PEO",
    },
    program: {
      type: String,
      required: true,
      default: "BS Computer Science",
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.PLO || mongoose.model("PLO", PLOSchema)

