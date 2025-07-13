import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Admin from "@/lib/models/Admin"
import Faculty from "@/lib/models/Faculty"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { username, password } = await request.json()

    // Check in Admin collection first
    let admin = await Admin.findOne({ username })
    let isFromFaculty = false

    // If not found in Admin, check Faculty collection for admin designation
    if (!admin) {
      const facultyAdmin = await Faculty.findOne({
        username,
        designation: "Admin",
        isAdmin: true,
      })

      if (facultyAdmin) {
        admin = facultyAdmin
        isFromFaculty = true
      }
    }

    if (!admin || admin.password !== password) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name || admin.username,
        source: isFromFaculty ? "faculty" : "admin",
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
