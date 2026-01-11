"use client"

import { useRouter, useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { CourseForm } from "@/components/course-form"
import { getCourseById, updateCourse, type UpdateCourseDto } from "@/lib/course-service"
import { getAllPrograms } from "@/lib/program-service"
import { useEffect } from "react"

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const courseId = Number.parseInt(params.id as string)

  // Check if user has permission
  useEffect(() => {
    if (user && user.role !== "Admin" && user.role !== "SuperAdmin") {
      router.push("/admin/courses")
    }
  }, [user, router])

  // Fetch course
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  })

  // Fetch programs
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: getAllPrograms,
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseDto }) => updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      queryClient.invalidateQueries({ queryKey: ["course", courseId] })
      toast({
        title: "Success",
        description: "Course updated successfully",
      })
      router.push(`/admin/courses/${courseId}`)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (data: UpdateCourseDto) => {
    if (!course) return

    // Only send changed fields
    const updateData: UpdateCourseDto = {}
    if (data.course_code !== course.course_code) updateData.course_code = data.course_code
    if (data.course_name !== course.course_name) updateData.course_name = data.course_name
    if (data.course_description !== course.course_description) updateData.course_description = data.course_description
    if (data.credit_hours !== course.credit_hours) updateData.credit_hours = data.credit_hours
    if (data.program_id !== course.program_id) updateData.program_id = data.program_id
    if (data.semester_number !== course.semester_number) updateData.semester_number = data.semester_number
    if (data.course_type !== course.course_type) updateData.course_type = data.course_type

    await updateMutation.mutateAsync({ id: course.id, data: updateData })
  }

  if (courseLoading || programsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
        <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push("/admin/courses")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>
    )
  }

  if (user && user.role !== "Admin" && user.role !== "SuperAdmin") {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
        <p className="text-gray-600 mt-2">Update course information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>Update the course details below</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm
            programs={programs}
            initialData={course}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/admin/courses/${courseId}`)}
            isLoading={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}

