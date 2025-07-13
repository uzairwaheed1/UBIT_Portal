import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Assignment from "@/lib/models/Assignment"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { assignmentId, rollNo } = await request.json()

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 })
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find((sub: any) => sub.rollNo === rollNo)

    if (existingSubmission) {
      return NextResponse.json({ success: false, message: "Assignment already submitted" }, { status: 400 })
    }

    // Add submission
    assignment.submissions.push({
      rollNo,
      submittedAt: new Date(),
      status: "submit",
    })

    await assignment.save()

    return NextResponse.json({
      success: true,
      message: "Assignment submitted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
