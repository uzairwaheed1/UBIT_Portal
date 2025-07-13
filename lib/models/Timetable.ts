import mongoose from "mongoose"

const TimetableSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    courseCode: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    time: {
      type: String,
      required: true,
    },
    classType: {
      type: String,
      required: true,
      enum: ["Lecture", "Lab"],
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

export default mongoose.models.Timetable || mongoose.model("Timetable", TimetableSchema)
