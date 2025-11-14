import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import PEO from "@/lib/models/PEO"

export async function GET() {
  try {
    await connectDB()
    const peos = await PEO.find({}).sort({ peoId: 1 })
    return NextResponse.json({ success: true, peos })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { peoId, peoName, description, program } = await request.json()

    const existingPEO = await PEO.findOne({ peoId })

    if (existingPEO) {
      return NextResponse.json(
        { success: false, message: "PEO with this ID already exists" },
        { status: 400 },
      )
    }

    const peo = new PEO({
      peoId,
      peoName,
      description,
      program,
    })

    await peo.save()

    return NextResponse.json({
      success: true,
      message: "PEO added successfully",
      peo,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const { id, ...updateData } = await request.json()

    const peo = await PEO.findByIdAndUpdate(id, updateData, { new: true })

    if (!peo) {
      return NextResponse.json({ success: false, message: "PEO not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "PEO updated successfully",
      peo,
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
      return NextResponse.json({ success: false, message: "PEO ID is required" }, { status: 400 })
    }

    const peo = await PEO.findByIdAndDelete(id)

    if (!peo) {
      return NextResponse.json({ success: false, message: "PEO not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "PEO deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

