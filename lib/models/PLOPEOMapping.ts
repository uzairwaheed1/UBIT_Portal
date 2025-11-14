import mongoose from "mongoose"

const PLOPEOMappingSchema = new mongoose.Schema(
  {
    ploId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PLO",
      required: true,
    },
    peoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PEO",
      required: true,
    },
    strength: {
      type: String,
      enum: ["Strong", "Moderate", "Weak"],
      default: "Moderate",
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.PLOPEOMapping || mongoose.model("PLOPEOMapping", PLOPEOMappingSchema)

