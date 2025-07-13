import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Course from "@/lib/models/Course"

export async function GET() {
  try {
    await connectDB()
    const courses = await Course.find({}).sort({ semester: 1, courseCode: 1 })
    return NextResponse.json({ success: true, courses })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { courseCode, courseName, credits, semester, instructor } = await request.json()

    // Check if course already exists
    const existingCourse = await Course.findOne({ courseCode })
    if (existingCourse) {
      return NextResponse.json({ success: false, message: "Course with this code already exists" }, { status: 400 })
    }

    const course = new Course({
      courseCode,
      courseName,
      credits,
      semester,
      instructor,
    })

    await course.save()

    return NextResponse.json({
      success: true,
      message: "Course added successfully",
      course,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
