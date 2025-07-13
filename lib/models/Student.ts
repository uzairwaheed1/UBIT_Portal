import mongoose from "mongoose"

const StudentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    domain: {
      type: String,
      required: true,
      enum: ["CS", "SE", "AI"],
    },
    password: {
      type: String,
      default: "student123", // Default password
    },
    program: {
      type: String,
      default: "BS Computer Science",
    },
    yearOfAdmission: {
      type: Number,
      default: new Date().getFullYear(),
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Student || mongoose.model("Student", StudentSchema)
