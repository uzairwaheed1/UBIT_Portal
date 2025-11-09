import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Assessment from "@/lib/models/Assessment"
import CLO from "@/lib/models/CLO"
import Student from "@/lib/models/Student"
import Course from "@/lib/models/Course"

// Helper function to calculate CLO attainment based on marking system
function calculateCLOAttainment(marks: {
  midterm: number
  assignment: number
  cep: number
  finalExam: number
  report: number
  rubric: number
  oe: number
  quiz: number
  practicalFinal: number
}) {
  // CLO mapping based on the marking system
  // CLO1 → PLO1: Theory components (Midterm + Assignment + CEP) = 40 marks
  // CLO2 → PLO2: Final Examination = 60 marks
  // CLO3 → PLO3: Practical components (Report + Rubric + OE) = 30 marks
  // CLO4 → PLO4: Practical components (Quiz + Practical Final) = 20 marks

  const theoryMarks = (marks.midterm || 0) + (marks.assignment || 0) + (marks.cep || 0)
  const practicalMarks1 = (marks.report || 0) + (marks.rubric || 0) + (marks.oe || 0)
  const practicalMarks2 = (marks.quiz || 0) + (marks.practicalFinal || 0)

  return [
    {
      cloId: "CLO1",
      cloName: "CLO1",
      marksObtained: theoryMarks,
      totalMarks: 40,
      attainmentPercent: theoryMarks > 0 ? Math.min(100, Math.max(0, (theoryMarks / 40) * 100)) : 0,
      linkedPLO: "PLO1",
    },
    {
      cloId: "CLO2",
      cloName: "CLO2",
      marksObtained: marks.finalExam || 0,
      totalMarks: 60,
      attainmentPercent: marks.finalExam > 0 ? Math.min(100, Math.max(0, ((marks.finalExam || 0) / 60) * 100)) : 0,
      linkedPLO: "PLO2",
    },
    {
      cloId: "CLO3",
      cloName: "CLO3",
      marksObtained: practicalMarks1,
      totalMarks: 30,
      attainmentPercent: practicalMarks1 > 0 ? Math.min(100, Math.max(0, (practicalMarks1 / 30) * 100)) : 0,
      linkedPLO: "PLO3",
    },
    {
      cloId: "CLO4",
      cloName: "CLO4",
      marksObtained: practicalMarks2,
      totalMarks: 20,
      attainmentPercent: practicalMarks2 > 0 ? Math.min(100, Math.max(0, (practicalMarks2 / 20) * 100)) : 0,
      linkedPLO: "PLO4",
    },
  ]
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      studentId,
      courseId,
      midterm,
      assignment,
      cep,
      finalExam,
      report,
      rubric,
      oe,
      quiz,
      practicalFinal,
    } = body

    // Validate required fields
    if (!studentId || !courseId) {
      return NextResponse.json({ success: false, error: "Student ID and Course ID are required" }, { status: 400 })
    }

    // Verify student and course exist
    const student = await Student.findById(studentId)
    const course = await Course.findById(courseId)

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
    }

    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
    }

    // Check if assessment already exists for this student and course
    const existingAssessment = await Assessment.findOne({
      studentId,
      courseId,
    })

    const marks = {
      midterm: midterm || 0,
      assignment: assignment || 0,
      cep: cep || 0,
      finalExam: finalExam || 0,
      report: report || 0,
      rubric: rubric || 0,
      oe: oe || 0,
      quiz: quiz || 0,
      practicalFinal: practicalFinal || 0,
    }

    // Calculate CLO attainment
    const cloAttainment = calculateCLOAttainment(marks)

    if (existingAssessment) {
      // Update existing assessment
      existingAssessment.midterm = marks.midterm
      existingAssessment.assignment = marks.assignment
      existingAssessment.cep = marks.cep
      existingAssessment.finalExam = marks.finalExam
      existingAssessment.report = marks.report
      existingAssessment.rubric = marks.rubric
      existingAssessment.oe = marks.oe
      existingAssessment.quiz = marks.quiz
      existingAssessment.practicalFinal = marks.practicalFinal
      existingAssessment.cloAttainment = cloAttainment
      await existingAssessment.save()

      const populated = await Assessment.findById(existingAssessment._id)
        .populate("studentId", "rollNo name email")
        .populate("courseId", "courseCode courseName")

      return NextResponse.json({
        success: true,
        data: populated,
        message: "Assessment updated successfully",
      })
    } else {
      // Create new assessment
      const assessment = new Assessment({
        studentId,
        courseId,
        ...marks,
        cloAttainment,
      })

      await assessment.save()

      const populated = await Assessment.findById(assessment._id)
        .populate("studentId", "rollNo name email")
        .populate("courseId", "courseCode courseName")

      return NextResponse.json({
        success: true,
        data: populated,
        message: "Assessment saved successfully",
      })
    }
  } catch (error: any) {
    console.error("Error saving assessment:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to save assessment" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")
    const studentId = searchParams.get("studentId")

    let query: any = {}

    if (courseId) {
      query.courseId = courseId
    }

    if (studentId) {
      query.studentId = studentId
    }

    const assessments = await Assessment.find(query)
      .populate("studentId", "rollNo name email")
      .populate("courseId", "courseCode courseName")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: assessments,
    })
  } catch (error: any) {
    console.error("Error fetching assessments:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch assessments" }, { status: 500 })
  }
}
