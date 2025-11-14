import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Student from "@/lib/models/Student"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { students } = await request.json()

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid student data. Expected an array of students." },
        { status: 400 },
      )
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const studentData of students) {
      try {
        // Validate required fields
        if (!studentData.rollNo || !studentData.name || !studentData.email) {
          results.failed++
          results.errors.push(`Missing required fields for student: ${studentData.rollNo || "Unknown"}`)
          continue
        }

        // Check if student already exists
        const existing = await Student.findOne({
          $or: [{ rollNo: studentData.rollNo }, { email: studentData.email }],
        })

        if (existing) {
          results.failed++
          results.errors.push(`Student with rollNo ${studentData.rollNo} or email ${studentData.email} already exists`)
          continue
        }

        // Create new student
        const student = new Student({
          rollNo: studentData.rollNo,
          name: studentData.name,
          email: studentData.email,
          semester: studentData.semester || 1,
          domain: studentData.domain || "CS",
          password: studentData.password || "student123",
          program: studentData.program || "BS Computer Science",
          yearOfAdmission: studentData.yearOfAdmission || new Date().getFullYear(),
        })

        await student.save()
        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push(`Error importing ${studentData.rollNo || "Unknown"}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.success} successful, ${results.failed} failed`,
      results,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}

