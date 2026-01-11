"use client"

import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { CourseForm } from "@/components/course-form"
import { getAllPrograms } from "@/lib/program-service"
import { createCourse, type CreateCourseDto } from "@/lib/course-service"
import { useEffect } from "react"

export default function CreateCoursePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Check if user has permission
  useEffect(() => {
    if (user && user.role !== "Admin" && user.role !== "SuperAdmin") {
      router.push("/admin/courses")
    }
  }, [user, router])

  // Fetch programs
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: getAllPrograms,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      toast({
        title: "Success",
        description: "Course created successfully",
      })
      router.push("/admin/courses")
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (data: CreateCourseDto) => {
    await createMutation.mutateAsync(data)
  }

  if (programsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user && user.role !== "Admin" && user.role !== "SuperAdmin") {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Course</h1>
        <p className="text-gray-600 mt-2">Add a new course to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>Enter the course details below</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm
            programs={programs}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/courses")}
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}

