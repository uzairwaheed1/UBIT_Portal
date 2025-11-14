import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Batch from "@/lib/models/Batch"

export async function GET() {
  try {
    await connectDB()
    const batches = await Batch.find({}).sort({ yearOfAdmission: -1 })
    return NextResponse.json({ success: true, batches })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { batchId, batchName, yearOfAdmission, program, status } = await request.json()

    const existingBatch = await Batch.findOne({ batchId })

    if (existingBatch) {
      return NextResponse.json(
        { success: false, message: "Batch with this ID already exists" },
        { status: 400 },
      )
    }

    const batch = new Batch({
      batchId,
      batchName,
      yearOfAdmission,
      program,
      status,
    })

    await batch.save()

    return NextResponse.json({
      success: true,
      message: "Batch added successfully",
      batch,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const { id, ...updateData } = await request.json()

    const batch = await Batch.findByIdAndUpdate(id, updateData, { new: true })

    if (!batch) {
      return NextResponse.json({ success: false, message: "Batch not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Batch updated successfully",
      batch,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, message: "Batch ID is required" }, { status: 400 })
    }

    const batch = await Batch.findByIdAndDelete(id)

    if (!batch) {
      return NextResponse.json({ success: false, message: "Batch not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Batch deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

