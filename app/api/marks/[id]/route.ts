import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Marks from "@/lib/models/Marks"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const updateData = await request.json()

    // Calculate total marks
    const obtainedMarks = (updateData.theoryObtained || 0) + (updateData.labObtained || 0)
    const totalMarks = (updateData.theoryTotal || 0) + (updateData.labTotal || 0)

    const finalData = {
      ...updateData,
      obtainedMarks,
      totalMarks,
    }

    const marks = await Marks.findByIdAndUpdate(id, finalData, { new: true })

    if (!marks) {
      return NextResponse.json({ success: false, message: "Marks not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Marks updated successfully",
      marks,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params

    const marks = await Marks.findByIdAndDelete(id)

    if (!marks) {
      return NextResponse.json({ success: false, message: "Marks not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Marks deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
