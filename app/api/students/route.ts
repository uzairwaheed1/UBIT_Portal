import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Student from "@/lib/models/Student"

export async function GET() {
  try {
    await connectDB()
    const students = await Student.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, students })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { rollNo, name, email, semester, domain } = await request.json()

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ rollNo }, { email }],
    })

    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: "Student with this roll number or email already exists" },
        { status: 400 },
      )
    }

    const student = new Student({
      rollNo,
      name,
      email,
      semester,
      domain,
      password: "student123", // Default password for all students
    })

    await student.save()

    return NextResponse.json({
      success: true,
      message: "Student added successfully",
      student,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
