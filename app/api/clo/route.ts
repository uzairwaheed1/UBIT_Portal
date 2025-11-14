import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import CLO from "@/lib/models/CLO"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    let query: any = {}
    if (courseId) query.course = courseId

    const clos = await CLO.find(query).sort({ cloId: 1 })
    return NextResponse.json({ success: true, clos })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { cloId, cloName, description, totalMarks, linkedPLO, course } = await request.json()

    const existingCLO = await CLO.findOne({ cloId, course })

    if (existingCLO) {
      return NextResponse.json(
        { success: false, message: "CLO with this ID already exists for this course" },
        { status: 400 },
      )
    }

    const clo = new CLO({
      cloId,
      cloName,
      description,
      totalMarks,
      linkedPLO,
      course,
    })

    await clo.save()

    return NextResponse.json({
      success: true,
      message: "CLO added successfully",
      clo,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const { id, ...updateData } = await request.json()

    const clo = await CLO.findByIdAndUpdate(id, updateData, { new: true })

    if (!clo) {
      return NextResponse.json({ success: false, message: "CLO not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "CLO updated successfully",
      clo,
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
      return NextResponse.json({ success: false, message: "CLO ID is required" }, { status: 400 })
    }

    const clo = await CLO.findByIdAndDelete(id)

    if (!clo) {
      return NextResponse.json({ success: false, message: "CLO not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "CLO deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

