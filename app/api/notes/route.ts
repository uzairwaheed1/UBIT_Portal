import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Notes from "@/lib/models/Notes"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const semester = searchParams.get("semester")

    const query: any = {}
    if (semester) query.semester = Number(semester)

    const notes = await Notes.find(query).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, notes })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { title, description, semester, fileName, fileUrl, course } = await request.json()

    const notes = new Notes({
      title,
      description,
      semester,
      fileName,
      fileUrl,
      course,
    })

    await notes.save()

    return NextResponse.json({
      success: true,
      message: "Notes uploaded successfully",
      notes,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
