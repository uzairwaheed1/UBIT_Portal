import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Fees from "@/lib/models/Fees"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const program = searchParams.get("program")
    const yearOfAdmission = searchParams.get("yearOfAdmission")

    const query: any = {}
    if (program) query.program = program
    if (yearOfAdmission) query.yearOfAdmission = Number(yearOfAdmission)

    const fees = await Fees.find(query).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, fees })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { program, yearOfAdmission, examFee, dueDate, tuitionFee, labFee, libraryFee } = await request.json()

    const fees = new Fees({
      program,
      yearOfAdmission,
      examFee,
      dueDate: new Date(dueDate),
      tuitionFee,
      labFee,
      libraryFee,
    })

    await fees.save()

    return NextResponse.json({
      success: true,
      message: "Fees updated successfully",
      fees,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
