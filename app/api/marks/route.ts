import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Marks from "@/lib/models/Marks"
import Student from "@/lib/models/Student"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const rollNo = searchParams.get("rollNo")
    const semester = searchParams.get("semester")

    const query: any = {}
    if (rollNo) query.rollNo = rollNo
    if (semester) query.semester = Number(semester)

    const marks = await Marks.find(query).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, marks })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { rollNo, course, examType, semester, theoryTotal, theoryObtained, labTotal, labObtained } =
      await request.json()

    // Check if student exists
    const student = await Student.findOne({ rollNo })
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    const totalMarks = (theoryTotal || 0) + (labTotal || 0)
    const obtainedMarks = (theoryObtained || 0) + (labObtained || 0)

    const marks = new Marks({
      rollNo,
      course,
      examType,
      semester,
      theoryTotal: theoryTotal || 0,
      theoryObtained: theoryObtained || 0,
      labTotal: labTotal || 0,
      labObtained: labObtained || 0,
      totalMarks,
      obtainedMarks,
    })

    await marks.save()

    return NextResponse.json({
      success: true,
      message: "Marks uploaded successfully",
      marks,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
