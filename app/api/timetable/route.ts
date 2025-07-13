import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Timetable from "@/lib/models/Timetable"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const semester = searchParams.get("semester")

    const query: any = {}
    if (semester) query.semester = Number(semester)

    const timetable = await Timetable.find(query).sort({ day: 1, time: 1 })
    return NextResponse.json({ success: true, timetable })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { semester, year, courseCode, courseName, date, day, time, classType, instructor } = await request.json()

    const timetable = new Timetable({
      semester,
      year,
      courseCode,
      courseName,
      date: new Date(date),
      day,
      time,
      classType,
      instructor,
    })

    await timetable.save()

    return NextResponse.json({
      success: true,
      message: "Timetable uploaded successfully",
      timetable,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
