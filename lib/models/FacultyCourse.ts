import mongoose from "mongoose"

const FacultyCourseSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
)

// Ensure unique combination of faculty, course, and semester
FacultyCourseSchema.index({ facultyId: 1, courseId: 1, semester: 1 }, { unique: true })

export default mongoose.models.FacultyCourse || mongoose.model("FacultyCourse", FacultyCourseSchema)

