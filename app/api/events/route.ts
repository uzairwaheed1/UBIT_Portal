import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Event from "@/lib/models/Event"

export async function GET() {
  try {
    await connectDB()
    const events = await Event.find({ time: { $gte: new Date() } }).sort({ time: 1 })
    return NextResponse.json({ success: true, events })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { eventName, type, priority, time, location, attendees, description } = await request.json()

    const event = new Event({
      eventName,
      type,
      priority,
      time: new Date(time),
      location,
      attendees,
      description,
    })

    await event.save()

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      event,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
