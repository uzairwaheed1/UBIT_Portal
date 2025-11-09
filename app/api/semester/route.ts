import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Semester from "@/lib/models/Semester"

// GET /api/semester -> fetch all semesters with optional filters ?name=&status=
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    const status = searchParams.get("status")

    const query: any = {}
    if (name) query.name = { $regex: name, $options: "i" }
    if (status) query.status = status

    const semesters = await Semester.find(query).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, semesters })
  } catch (error: any) {
    console.error("Error fetching semesters:", error)
    
    // Check if it's a MongoDB connection error
    if (error?.message?.includes("ECONNREFUSED") || error?.message?.includes("connect")) {
      return NextResponse.json({ 
        success: false, 
        message: "Database connection failed. Please ensure MongoDB is running or check your connection string.",
        semesters: []
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: error?.message || "Server error",
      semesters: []
    }, { status: 500 })
  }
}

// POST /api/semester -> add new semester
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { semesterId, name, startDate, endDate, status } = body

    if (!semesterId || !name || !startDate || !endDate) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Check uniqueness of semesterId
    const existing = await Semester.findOne({ semesterId })
    if (existing) {
      return NextResponse.json({ success: false, message: "Semester ID already exists" }, { status: 400 })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ success: false, message: "Invalid date format" }, { status: 400 })
    }

    if (end < start) {
      return NextResponse.json({ success: false, message: "End date must be after start date" }, { status: 400 })
    }

    const semester = new Semester({
      semesterId,
      name,
      startDate: start,
      endDate: end,
      status: status || "Active",
    })
    await semester.save()

    return NextResponse.json({ success: true, message: "Semester added successfully", semester })
  } catch (error: any) {
    console.error("Error adding semester:", error)
    
    // Check if it's a MongoDB connection error
    if (error?.message?.includes("ECONNREFUSED") || error?.message?.includes("connect")) {
      return NextResponse.json({ 
        success: false, 
        message: "Database connection failed. Please ensure MongoDB is running or check your connection string." 
      }, { status: 503 })
    }
    
    const errorMessage = error?.message || "Server error"
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  }
}