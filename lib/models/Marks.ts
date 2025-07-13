import mongoose from "mongoose"

const MarksSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      ref: "Student",
    },
    course: {
      type: String,
      required: true,
    },
    examType: {
      type: String,
      required: true,
      enum: ["Mid", "Final", "Quiz", "Assignment"],
    },
    semester: {
      type: Number,
      required: true,
    },
    theoryTotal: {
      type: Number,
      default: 0,
    },
    theoryObtained: {
      type: Number,
      default: 0,
    },
    labTotal: {
      type: Number,
      default: 0,
    },
    labObtained: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    obtainedMarks: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Marks || mongoose.model("Marks", MarksSchema)
