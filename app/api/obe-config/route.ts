import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import OBEConfig from "@/lib/models/OBEConfig"

export async function GET() {
  try {
    await connectDB()
    const config = await OBEConfig.findOne({ isActive: true })
    return NextResponse.json({ success: true, config: config || null })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Deactivate all existing configs
    await OBEConfig.updateMany({}, { isActive: false })

    const body = await request.json()
    const config = new OBEConfig({
      ...body,
      isActive: true,
    })

    await config.save()

    return NextResponse.json({
      success: true,
      message: "OBE configuration saved successfully",
      config,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const { id, ...updateData } = await request.json()

    // If setting as active, deactivate others
    if (updateData.isActive) {
      await OBEConfig.updateMany({ _id: { $ne: id } }, { isActive: false })
    }

    const config = await OBEConfig.findByIdAndUpdate(id, updateData, { new: true })

    if (!config) {
      return NextResponse.json({ success: false, message: "Configuration not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Configuration updated successfully",
      config,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

