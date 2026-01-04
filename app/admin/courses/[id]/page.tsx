"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Plus } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getCourseById } from "@/lib/course-service"
import { getAllPrograms } from "@/lib/program-service"
import { getCLOsByCourseId, CLO } from "@/lib/clo-service"
import { CloList } from "@/components/clo/clo-list"
import { CloDialog } from "@/components/clo/clo-dialog"
import { CreateCloDialog } from "@/components/clo/create-clo-dialog"

export default function ViewCoursePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const courseId = Number.parseInt(params.id as string)

  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin"

  // State for CLO dialogs
  const [createCloOpen, setCreateCloOpen] = useState(false)
  const [selectedClo, setSelectedClo] = useState<CLO | null>(null)
  const [cloDialogOpen, setCloDialogOpen] = useState(false)

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  })

  const { data: programs = [] } = useQuery({
    queryKey: ["programs"],
    queryFn: getAllPrograms,
  })

  // Fetch CLOs for the current course
  const { data: clos = [], isLoading: closLoading } = useQuery({
    queryKey: ["clos", courseId],
    queryFn: () => getCLOsByCourseId(courseId),
    enabled: !!courseId,
  })

  // Refresh CLOs after create/update/delete
  const handleCloSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["clos", courseId] })
  }

  // Handle CLO click - open dialog with CLO details
  const handleCloClick = (clo: CLO) => {
    setSelectedClo(clo)
    setCloDialogOpen(true)
  }

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
        <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/admin/courses")}>Back to Courses</Button>
      </div>
    )
  }

  const program = programs.find((p) => p.id === course.program_id)

  const getCourseTypeBadgeVariant = (type: string) => {
    const typeLower = type.toLowerCase()
    if (typeLower.includes("core") || typeLower.includes("major")) return "default"
    if (typeLower.includes("elective")) return "secondary"
    if (typeLower.includes("lab")) return "outline"
    return "default"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/admin/courses")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.course_name}</h1>
            <p className="text-gray-600 mt-2">Course Details</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateCloOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create CLO
            </Button>
            <Button onClick={() => router.push(`/admin/courses/${course.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Course
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Course Code</label>
              <p className="text-lg font-semibold text-gray-900">{course.course_code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Course Name</label>
              <p className="text-lg text-gray-900">{course.course_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Credit Hours</label>
              <p className="text-lg text-gray-900">{course.credit_hours}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Semester</label>
              <p className="text-lg text-gray-900">Semester {course.semester_number}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Course Type</label>
              <div className="mt-1">
                <Badge variant={getCourseTypeBadgeVariant(course.course_type)}>
                  {course.course_type}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Program</label>
              <p className="text-lg text-gray-900">{program?.name || `Program ${course.program_id}`}</p>
              {program && (
                <p className="text-sm text-gray-500">{program.code} - {program.department}</p>
              )}
            </div>
            {course.createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm text-gray-900">
                  {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {course.updatedAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm text-gray-900">
                  {new Date(course.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {/* CLO List */}
            <div className="mt-4">
              {closLoading ? (
                <div>
                  <label className="text-sm font-medium text-gray-500">Course Learning Outcomes</label>
                  <p className="text-sm text-gray-500 mt-1">Loading...</p>
                </div>
              ) : (
                <CloList clos={clos} onCloClick={handleCloClick} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CLO Dialogs */}
      <CreateCloDialog
        open={createCloOpen}
        onOpenChange={setCreateCloOpen}
        courseId={courseId}
        onSuccess={handleCloSuccess}
      />

      <CloDialog
        open={cloDialogOpen}
        onOpenChange={setCloDialogOpen}
        clo={selectedClo}
        onSuccess={handleCloSuccess}
      />

      {course.course_description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{course.course_description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

