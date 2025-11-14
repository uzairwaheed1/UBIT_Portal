import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Student from "@/lib/models/Student"
import Course from "@/lib/models/Course"
import Faculty from "@/lib/models/Faculty"
import Batch from "@/lib/models/Batch"
import Semester from "@/lib/models/Semester"
import CLO from "@/lib/models/CLO"
import PLO from "@/lib/models/PLO"
import PEO from "@/lib/models/PEO"

export async function GET() {
  try {
    await connectDB()

    const [
      totalStudents,
      totalCourses,
      totalFaculty,
      totalBatches,
      activeSemesters,
      totalCLOs,
      totalPLOs,
      totalPEOs,
    ] = await Promise.all([
      Student.countDocuments(),
      Course.countDocuments(),
      Faculty.countDocuments(),
      Batch.countDocuments(),
      Semester.countDocuments({ status: "Active" }),
      CLO.countDocuments(),
      PLO.countDocuments(),
      PEO.countDocuments(),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalFaculty,
        totalBatches,
        activeSemesters,
        totalCLOs,
        totalPLOs,
        totalPEOs,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
