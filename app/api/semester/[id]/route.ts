import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Semester from "@/lib/models/Semester"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await request.json()
    const { semesterId, name, startDate, endDate, status } = body

    if (!semesterId || !name || !startDate || !endDate) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ success: false, message: "Invalid date format" }, { status: 400 })
    }

    if (end < start) {
      return NextResponse.json({ success: false, message: "End date must be after start date" }, { status: 400 })
    }

    // Check if semesterId is being changed and if it conflicts with another semester
    const existingSemester = await Semester.findById(params.id)
    if (!existingSemester) {
      return NextResponse.json({ success: false, message: "Semester not found" }, { status: 404 })
    }

    if (existingSemester.semesterId !== semesterId) {
      const duplicate = await Semester.findOne({ semesterId, _id: { $ne: params.id } })
      if (duplicate) {
        return NextResponse.json({ success: false, message: "Semester ID already exists" }, { status: 400 })
      }
    }

    const semester = await Semester.findByIdAndUpdate(
      params.id,
      {
        semesterId,
        name,
        startDate: start,
        endDate: end,
        status: status || "Active",
      },
      { new: true }
    )

    if (!semester) {
      return NextResponse.json({ success: false, message: "Semester not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Semester updated successfully",
      semester,
    })
  } catch (error: any) {
    console.error("Error updating semester:", error)
    const errorMessage = error?.message || "Server error"
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const semester = await Semester.findByIdAndDelete(params.id)

    if (!semester) {
      return NextResponse.json({ success: false, message: "Semester not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Semester deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting semester:", error)
    const errorMessage = error?.message || "Server error"
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  }
}

