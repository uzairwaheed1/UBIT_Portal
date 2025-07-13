import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Faculty from "@/lib/models/Faculty"

export async function GET() {
  try {
    await connectDB()
    const faculty = await Faculty.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, faculty })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { facultyId, name, email, department, designation, username, password } = await request.json()

    // Check if faculty already exists
    const existingFaculty = await Faculty.findOne({
      $or: [{ facultyId }, { email }, { username }],
    })

    if (existingFaculty) {
      return NextResponse.json(
        { success: false, message: "Faculty with this ID, email, or username already exists" },
        { status: 400 },
      )
    }

    const faculty = new Faculty({
      facultyId,
      name,
      email,
      department,
      designation,
      username,
      password,
    })

    await faculty.save()

    return NextResponse.json({
      success: true,
      message: "Faculty added successfully",
      faculty,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const { id, ...updateData } = await request.json()

    const faculty = await Faculty.findByIdAndUpdate(id, updateData, { new: true })

    if (!faculty) {
      return NextResponse.json({ success: false, message: "Faculty not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Faculty updated successfully",
      faculty,
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
      return NextResponse.json({ success: false, message: "Faculty ID is required" }, { status: 400 })
    }

    const faculty = await Faculty.findByIdAndDelete(id)

    if (!faculty) {
      return NextResponse.json({ success: false, message: "Faculty not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Faculty deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
