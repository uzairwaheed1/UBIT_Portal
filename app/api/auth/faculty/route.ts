// For preview mode without DB, mock the faculty login
import { type NextRequest, NextResponse } from "next/server"
// import connectDB from "@/lib/mongodb"
// import Faculty from "@/lib/models/Faculty"

export async function POST(request: NextRequest) {
  try {
    // await connectDB()

    const { username, password } = await request.json()

    // Mock faculty credentials check - use demo or any for preview
    if (username && password) {  // Accept any non-empty credentials for preview
      return NextResponse.json({
        success: true,
        faculty: {
          _id: "mock-faculty-id",
          facultyId: "F001",
          name: "Mock Faculty",
          email: "faculty@example.com",
          department: "Computer Science",
          designation: "Professor",
          username: username,
        },
      })
    } else {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Original code commented out for preview
    /*
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
    */
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
