import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import PLO from "@/lib/models/PLO"

export async function GET() {
  try {
    await connectDB()
    const plos = await PLO.find({}).sort({ ploId: 1 })
    return NextResponse.json({ success: true, plos })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { ploId, ploName, description, linkedPEO, program } = await request.json()

    const existingPLO = await PLO.findOne({ ploId })

    if (existingPLO) {
      return NextResponse.json(
        { success: false, message: "PLO with this ID already exists" },
        { status: 400 },
      )
    }

    const plo = new PLO({
      ploId,
      ploName,
      description,
      linkedPEO,
      program,
    })

    await plo.save()

    return NextResponse.json({
      success: true,
      message: "PLO added successfully",
      plo,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const { id, ...updateData } = await request.json()

    const plo = await PLO.findByIdAndUpdate(id, updateData, { new: true })

    if (!plo) {
      return NextResponse.json({ success: false, message: "PLO not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "PLO updated successfully",
      plo,
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
      return NextResponse.json({ success: false, message: "PLO ID is required" }, { status: 400 })
    }

    const plo = await PLO.findByIdAndDelete(id)

    if (!plo) {
      return NextResponse.json({ success: false, message: "PLO not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "PLO deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

