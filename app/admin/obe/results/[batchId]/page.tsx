"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, BookOpen, Calendar, Users, FileText, User, ArrowRight } from "lucide-react"
import { getBatchCourseResults, type CourseResult } from "@/lib/obe-results-service"
import { getBatchById } from "@/lib/batch-service"

export default function BatchResultsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params.batchId as string
  const { toast } = useToast()

  const [courses, setCourses] = useState<CourseResult[]>([])
  const [loading, setLoading] = useState(true)
  const [batchName, setBatchName] = useState<string>(`Batch ${batchId}`)

  useEffect(() => {
    if (batchId) {
      fetchBatchInfo()
      fetchCourseResults()
    }
  }, [batchId])

  const fetchBatchInfo = async () => {
    try {
      const numericId = parseInt(batchId)
      if (!isNaN(numericId)) {
        const batch = await getBatchById(numericId)
        const name = (batch as any).batchName || batch.name || `Batch ${batch.year || batchId}`
        setBatchName(name)
      }
    } catch (error) {
      console.error("Error fetching batch info:", error)
      // Fallback to default name
    }
  }

  const fetchCourseResults = async () => {
    try {
      setLoading(true)
      const data = await getBatchCourseResults(batchId)
      setCourses(data)
    } catch (error) {
      console.error("Error fetching course results:", error)
      // Don't show error toast if it's a 404 - backend might not be implemented yet
      if (error instanceof Error && !error.message.includes("404")) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch course results",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/obe/results">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          {loading ? (
            <Skeleton className="h-9 w-96 mb-2" />
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Results for {batchName}</h1>
              <p className="text-gray-600 mt-1">
                {courses.length} {courses.length === 1 ? "course" : "courses"} uploaded
              </p>
            </>
          )}
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">No courses found</p>
            <p className="text-gray-500 text-sm mb-4">No results have been uploaded for this batch yet</p>
            <Link href="/admin/obe/results/upload">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Upload Results
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span className="font-mono text-lg">{course.course_code}</span>
                    </div>
                    <p className="text-sm font-normal text-gray-600 mt-1 line-clamp-2">
                      {course.course_name}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Semester {course.semester}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {course.students_count} {course.students_count === 1 ? "student" : "students"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>Uploaded: {formatDate(course.uploaded_at)}</span>
                  </div>
                  {course.uploaded_by && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="truncate">{course.uploaded_by}</span>
                    </div>
                  )}
                </div>
                <Link href={`/admin/obe/results/${batchId}/course/${encodeURIComponent(course.course_code)}`}>
                  <Button variant="outline" className="w-full mt-4">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

