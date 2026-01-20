"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { obeService } from "@/lib/services/obe-service"
import type { CoursePLOData } from "@/lib/types/obe"
import { CoursePLOTable } from "@/components/obe/course-plo-table"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CoursePLOPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [courseData, setCourseData] = useState<CoursePLOData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchCourseData()
    }
  }, [user])

  const fetchCourseData = async () => {
    try {
      // You can get batchId from user data if available
      const batchId = user?.batch || undefined
      const data = await obeService.getCoursePLOData(user?.id?.toString() || "", batchId)
      setCourseData(data)
    } catch (error) {
      console.error("Error fetching course PLO data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePLOClick = (ploNumber: string) => {
    router.push(`/student/obe/plo/${ploNumber}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course PLO data...</p>
        </div>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">Unable to load course data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/student/obe")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course-wise PLO Performance</h1>
          <p className="text-gray-600 mt-2">
            View Program Learning Outcome attainment for all your courses
          </p>
        </div>
      </div>

      <CoursePLOTable data={courseData} onPLOClick={handlePLOClick} />
    </div>
  )
}
