import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Assignment from "@/lib/models/Assignment"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const updateData = await request.json()

    const assignment = await Assignment.findByIdAndUpdate(params.id, updateData, { new: true })

    if (!assignment) {
      return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully",
      assignment,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const assignment = await Assignment.findByIdAndDelete(params.id)

    if (!assignment) {
      return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
