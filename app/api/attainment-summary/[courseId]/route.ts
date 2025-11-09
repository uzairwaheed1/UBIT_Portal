import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Assessment from "@/lib/models/Assessment"
import CLO from "@/lib/models/CLO"
import Course from "@/lib/models/Course"

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    await connectDB()
    
    const { courseId } = params

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Verify course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Get all assessments for this course
    const assessments = await Assessment.find({ courseId }).populate("studentId", "rollNo name")

    if (assessments.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No assessments found for this course",
      })
    }

    // Calculate average attainment for each CLO/PLO
    const cloSummary: {
      [key: string]: {
        cloId: string
        cloName: string
        plo: string
        totalMarks: number
        totalStudents: number
        totalMarksObtained: number
        averageAttainment: number
        studentAttainments: number[]
      }
    } = {}

    assessments.forEach((assessment) => {
      assessment.cloAttainment.forEach((clo) => {
        if (!cloSummary[clo.cloId]) {
          cloSummary[clo.cloId] = {
            cloId: clo.cloId,
            cloName: clo.cloName,
            plo: clo.linkedPLO,
            totalMarks: clo.totalMarks,
            totalStudents: 0,
            totalMarksObtained: 0,
            averageAttainment: 0,
            studentAttainments: [],
          }
        }

        cloSummary[clo.cloId].totalStudents++
        cloSummary[clo.cloId].totalMarksObtained += clo.marksObtained
        cloSummary[clo.cloId].studentAttainments.push(clo.attainmentPercent)
      })
    })

    // Calculate average attainment for each CLO
    const summary = Object.values(cloSummary).map((clo) => {
      const averageAttainment =
        clo.studentAttainments.length > 0
          ? clo.studentAttainments.reduce((sum, att) => sum + att, 0) / clo.studentAttainments.length
          : 0

      return {
        cloId: clo.cloId,
        cloName: clo.cloName,
        plo: clo.plo,
        totalMarks: clo.totalMarks,
        studentCount: clo.totalStudents,
        averageMarksObtained: (clo.totalMarksObtained / clo.totalStudents).toFixed(2),
        averageAttainment: Number(averageAttainment.toFixed(2)),
        status: averageAttainment >= 70 ? "Achieved" : averageAttainment >= 50 ? "Partially Achieved" : "Not Achieved",
      }
    })

    // Also calculate PLO summary (aggregate of CLOs mapped to same PLO)
    const ploSummary: {
      [key: string]: {
        plo: string
        clos: string[]
        averageAttainment: number
        studentCount: number
      }
    } = {}

    summary.forEach((item) => {
      if (!ploSummary[item.plo]) {
        ploSummary[item.plo] = {
          plo: item.plo,
          clos: [],
          averageAttainment: 0,
          studentCount: 0,
        }
      }
      ploSummary[item.plo].clos.push(item.cloName)
      ploSummary[item.plo].averageAttainment += item.averageAttainment
      ploSummary[item.plo].studentCount = Math.max(ploSummary[item.plo].studentCount, item.studentCount)
    })

    // Calculate average PLO attainment (average of all CLOs mapped to that PLO)
    const ploSummaryArray = Object.values(ploSummary).map((plo) => ({
      plo: plo.plo,
      clos: plo.clos,
      averageAttainment: Number((plo.averageAttainment / plo.clos.length).toFixed(2)),
      studentCount: plo.studentCount,
      status:
        plo.averageAttainment / plo.clos.length >= 70
          ? "Achieved"
          : plo.averageAttainment / plo.clos.length >= 50
            ? "Partially Achieved"
            : "Not Achieved",
    }))

    return NextResponse.json({
      success: true,
      data: {
        cloSummary: summary,
        ploSummary: ploSummaryArray,
        course: {
          courseCode: course.courseCode,
          courseName: course.courseName,
        },
        totalStudents: assessments.length,
      },
    })
  } catch (error: any) {
    console.error("Error fetching attainment summary:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch attainment summary" }, { status: 500 })
  }
}
