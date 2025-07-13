import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Course from "@/lib/models/Course"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { courseCode, courseName, credits, semester, instructor } = await request.json()

    const course = await Course.findByIdAndUpdate(
      params.id,
      { courseCode, courseName, credits, semester, instructor },
      { new: true },
    )

    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      course,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const course = await Course.findByIdAndDelete(params.id)

    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
