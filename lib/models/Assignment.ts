import mongoose from "mongoose"

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    marks: {
      type: Number,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    submissions: [
      {
        rollNo: String,
        submittedAt: Date,
        status: {
          type: String,
          enum: ["submit", "unsubmit"],
          default: "unsubmit",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema)
