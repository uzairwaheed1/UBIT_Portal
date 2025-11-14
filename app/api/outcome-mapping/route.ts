import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import CLOPLOMapping from "@/lib/models/CLOPLOMapping"
import PLOPEOMapping from "@/lib/models/PLOPEOMapping"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "clo-plo" or "plo-peo"

    if (type === "clo-plo") {
      const mappings = await CLOPLOMapping.find({})
        .populate("cloId", "cloId cloName")
        .populate("ploId", "ploId ploName")
        .populate("courseId", "courseCode courseName")
      return NextResponse.json({ success: true, mappings })
    } else if (type === "plo-peo") {
      const mappings = await PLOPEOMapping.find({})
        .populate("ploId", "ploId ploName")
        .populate("peoId", "peoId peoName")
      return NextResponse.json({ success: true, mappings })
    }

    return NextResponse.json({ success: false, message: "Invalid type parameter" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { type, ...mappingData } = await request.json()

    if (type === "clo-plo") {
      const { cloId, ploId, courseId, strength } = mappingData

      // Check if mapping already exists
      const existing = await CLOPLOMapping.findOne({ cloId, ploId, courseId })
      if (existing) {
        return NextResponse.json(
          { success: false, message: "This mapping already exists" },
          { status: 400 },
        )
      }

      const mapping = new CLOPLOMapping({
        cloId,
        ploId,
        courseId,
        strength,
      })

      await mapping.save()

      const populated = await CLOPLOMapping.findById(mapping._id)
        .populate("cloId", "cloId cloName")
        .populate("ploId", "ploId ploName")
        .populate("courseId", "courseCode courseName")

      return NextResponse.json({
        success: true,
        message: "CLO-PLO mapping created successfully",
        mapping: populated,
      })
    } else if (type === "plo-peo") {
      const { ploId, peoId, strength } = mappingData

      // Check if mapping already exists
      const existing = await PLOPEOMapping.findOne({ ploId, peoId })
      if (existing) {
        return NextResponse.json(
          { success: false, message: "This mapping already exists" },
          { status: 400 },
        )
      }

      const mapping = new PLOPEOMapping({
        ploId,
        peoId,
        strength,
      })

      await mapping.save()

      const populated = await PLOPEOMapping.findById(mapping._id)
        .populate("ploId", "ploId ploName")
        .populate("peoId", "peoId peoName")

      return NextResponse.json({
        success: true,
        message: "PLO-PEO mapping created successfully",
        mapping: populated,
      })
    }

    return NextResponse.json({ success: false, message: "Invalid type parameter" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const type = searchParams.get("type")

    if (!id || !type) {
      return NextResponse.json(
        { success: false, message: "Mapping ID and type are required" },
        { status: 400 },
      )
    }

    if (type === "clo-plo") {
      const mapping = await CLOPLOMapping.findByIdAndDelete(id)
      if (!mapping) {
        return NextResponse.json({ success: false, message: "Mapping not found" }, { status: 404 })
      }
    } else if (type === "plo-peo") {
      const mapping = await PLOPEOMapping.findByIdAndDelete(id)
      if (!mapping) {
        return NextResponse.json({ success: false, message: "Mapping not found" }, { status: 404 })
      }
    } else {
      return NextResponse.json({ success: false, message: "Invalid type parameter" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Mapping deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

