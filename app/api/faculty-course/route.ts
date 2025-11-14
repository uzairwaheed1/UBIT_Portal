import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import FacultyCourse from "@/lib/models/FacultyCourse"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get("facultyId")
    const courseId = searchParams.get("courseId")

    let query: any = {}
    if (facultyId) query.facultyId = facultyId
    if (courseId) query.courseId = courseId

    const assignments = await FacultyCourse.find(query)
      .populate("facultyId", "name email facultyId")
      .populate("courseId", "courseCode courseName")
      .populate("batchId", "batchName")
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, assignments })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { facultyId, courseId, semester, batchId, status } = await request.json()

    // Check if assignment already exists
    const existing = await FacultyCourse.findOne({
      facultyId,
      courseId,
      semester,
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: "This course is already assigned to this faculty for this semester" },
        { status: 400 },
      )
    }

    const assignment = new FacultyCourse({
      facultyId,
      courseId,
      semester,
      batchId,
      status,
    })

    await assignment.save()

    const populated = await FacultyCourse.findById(assignment._id)
      .populate("facultyId", "name email facultyId")
      .populate("courseId", "courseCode courseName")
      .populate("batchId", "batchName")

    return NextResponse.json({
      success: true,
      message: "Course assigned successfully",
      assignment: populated,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, message: "Assignment ID is required" }, { status: 400 })
    }

    const assignment = await FacultyCourse.findByIdAndDelete(id)

    if (!assignment) {
      return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Course assignment removed successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

