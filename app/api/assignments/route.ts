import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Assignment from "@/lib/models/Assignment"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const semester = searchParams.get("semester")

    const query: any = {}
    if (semester) query.semester = Number(semester)

    const assignments = await Assignment.find(query).sort({ dueDate: 1 })
    return NextResponse.json({ success: true, assignments })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { title, description, dueDate, course, marks, semester } = await request.json()

    const assignment = new Assignment({
      title,
      description,
      dueDate: new Date(dueDate),
      course,
      marks,
      semester,
    })

    await assignment.save()

    return NextResponse.json({
      success: true,
      message: "Assignment created successfully",
      assignment,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
