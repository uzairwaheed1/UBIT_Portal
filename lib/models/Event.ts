import mongoose from "mongoose"

const EventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Academic", "Cultural", "Sports", "Workshop", "Seminar"],
    },
    priority: {
      type: String,
      required: true,
      enum: ["High", "Medium", "Low"],
    },
    time: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    attendees: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Event || mongoose.model("Event", EventSchema)
