import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Faculty from "@/lib/models/Faculty"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { username, password } = await request.json()

    const faculty = await Faculty.findOne({ username })

    if (!faculty) {
      return NextResponse.json({ success: false, message: "Faculty not found" }, { status: 404 })
    }

    // Simple password check (in production, use hashed passwords)
    if (faculty.password === password) {
      return NextResponse.json({
        success: true,
        faculty: {
          _id: faculty._id,
          facultyId: faculty.facultyId,
          name: faculty.name,
          email: faculty.email,
          department: faculty.department,
          designation: faculty.designation,
          username: faculty.username,
        },
      })
    } else {
      return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
