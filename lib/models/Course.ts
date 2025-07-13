import mongoose from "mongoose"

const CourseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Course || mongoose.model("Course", CourseSchema)
