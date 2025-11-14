import mongoose from "mongoose"

const PEOSchema = new mongoose.Schema(
  {
    peoId: {
      type: String,
      required: true,
      unique: true,
    },
    peoName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
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

export default mongoose.models.PEO || mongoose.model("PEO", PEOSchema)

