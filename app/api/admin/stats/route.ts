import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Student from "@/lib/models/Student"
import Course from "@/lib/models/Course"
import Assignment from "@/lib/models/Assignment"
import Event from "@/lib/models/Event"

export async function GET() {
  try {
    await connectDB()

    const [totalStudents, totalCourses, totalAssignments, upcomingEvents] = await Promise.all([
      Student.countDocuments(),
      Course.countDocuments(),
      Assignment.countDocuments(),
      Event.countDocuments({ time: { $gte: new Date() } }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalAssignments,
        upcomingEvents,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
