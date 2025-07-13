import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Fees from "@/lib/models/Fees"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const updateData = await request.json()

    const fee = await Fees.findByIdAndUpdate(id, updateData, { new: true })

    if (!fee) {
      return NextResponse.json({ success: false, message: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Fee record updated successfully",
      fee,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params

    const fee = await Fees.findByIdAndDelete(id)

    if (!fee) {
      return NextResponse.json({ success: false, message: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Fee record deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
