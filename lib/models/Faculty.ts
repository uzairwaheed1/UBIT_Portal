import mongoose from "mongoose"

const FacultySchema = new mongoose.Schema(
  {
    facultyId: {
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
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      sparse: true, // Only required for admin designation
    },
    password: {
      type: String,
      sparse: true, // Only required for admin designation
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Faculty || mongoose.model("Faculty", FacultySchema)
