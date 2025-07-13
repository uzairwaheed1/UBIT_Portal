import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Student from "@/lib/models/Student"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { rollNo, password } = await request.json()

    const student = await Student.findOne({ rollNo })

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    // Simple password check (in production, use hashed passwords)
    if (student.password === password) {
      return NextResponse.json({
        success: true,
        student: {
          _id: student._id,
          rollNo: student.rollNo,
          name: student.name,
          email: student.email,
          semester: student.semester,
          domain: student.domain,
        },
      })
    } else {
      return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
