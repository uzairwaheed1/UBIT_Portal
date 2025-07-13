import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Timetable from "@/lib/models/Timetable"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const updateData = await request.json()

    const timetable = await Timetable.findByIdAndUpdate(id, updateData, { new: true })

    if (!timetable) {
      return NextResponse.json({ success: false, message: "Timetable entry not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Timetable entry updated successfully",
      timetable,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params

    const timetable = await Timetable.findByIdAndDelete(id)

    if (!timetable) {
      return NextResponse.json({ success: false, message: "Timetable entry not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Timetable entry deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
