"use client"

import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { CourseOfferingForm } from "@/components/course-offering-form"
import { getAllBatches, getBatchById, getBatchSemesters } from "@/lib/batch-service"
import { getAllCourses } from "@/lib/course-service"
import {
  createCourseOffering,
  getActiveFaculty,
  getSemestersByBatch,
  type CreateCourseOfferingDto,
} from "@/lib/course-offering-service"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function CreateCourseOfferingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null)
  const [programId, setProgramId] = useState<number | null>(null)

  // Check if user has permission
  useEffect(() => {
    if (user && user.role !== "Admin" && user.role !== "SuperAdmin") {
      router.push("/admin/course-offerings")
    }
  }, [user, router])

  // Fetch batches
  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: getAllBatches,
  })

  // Fetch semesters when batch is selected
  const { data: semesters = [], isLoading: semestersLoading } = useQuery({
    queryKey: ["batch-semesters", selectedBatchId],
    queryFn: () => {
      if (!selectedBatchId) return Promise.resolve([])
      return getSemestersByBatch(selectedBatchId)
    },
    enabled: !!selectedBatchId,
  })

  // Fetch batch details to get program_id
  const { data: batchDetails } = useQuery({
    queryKey: ["batch", selectedBatchId],
    queryFn: () => {
      if (!selectedBatchId) return Promise.resolve(null)
      return getBatchById(selectedBatchId)
    },
    enabled: !!selectedBatchId,
  })

  // Update programId when batch details are fetched
  useEffect(() => {
    console.log("🔍 [Course Offering] Batch details changed:", {
      batchDetails,
      selectedBatchId,
      batchDetailsKeys: batchDetails ? Object.keys(batchDetails) : null,
    })

    if (batchDetails) {
      // Try to get program_id from batch
      // Check multiple possible field names
      const program =
        (batchDetails as any).program_id ||
        (batchDetails as any).programId ||
        (batchDetails as any).program?.id ||
        (batchDetails as any).program?.program_id

      console.log("📋 [Course Offering] Extracted program_id:", {
        program,
        program_id: (batchDetails as any).program_id,
        programId: (batchDetails as any).programId,
        programObject: (batchDetails as any).program,
        fullBatchDetails: batchDetails,
      })

      setProgramId(program || null)

      // If program_id is not found, log a warning
      if (!program) {
        console.warn("⚠️ [Course Offering] Batch does not have a program_id. Course filtering may not work correctly.")
        console.warn("Batch object structure:", JSON.stringify(batchDetails, null, 2))
      } else {
        console.log("✅ [Course Offering] Program ID set successfully:", program)
      }
    } else {
      console.log("🔄 [Course Offering] Resetting programId (no batch details)")
      setProgramId(null)
    }
  }, [batchDetails, selectedBatchId])

  // Fetch courses (will be filtered by program in the form)
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => getAllCourses(),
  })

  // Log courses and programId changes
  useEffect(() => {
    console.log("📚 [Course Offering] Courses data:", {
      coursesCount: courses.length,
      courses: courses.map((c) => ({ id: c.id, code: c.course_code, program_id: c.program_id })),
      programId,
      filteredCoursesCount: programId
        ? courses.filter((c) => c.program_id === programId).length
        : courses.length,
    })
  }, [courses, programId])

  // Fetch faculty
  const { data: faculty = [], isLoading: facultyLoading } = useQuery({
    queryKey: ["active-faculty"],
    queryFn: getActiveFaculty,
  })

  console.log("📝 [MAIN COMPONENT Course Offering] Faculty:", faculty)

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createCourseOffering,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-offerings"] })
      toast({
        title: "Success",
        description: "Course offering created successfully",
      })
      router.push("/admin/course-offerings")
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course offering",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (data: CreateCourseOfferingDto) => {
    await createMutation.mutateAsync(data)
  }

  const handleBatchChange = (batchId: number | null) => {
    console.log("🔄 [Course Offering] Batch changed:", {
      batchId,
      availableBatches: batches,
      selectedBatch: batchId ? batches.find((b) => b.id === batchId) : null,
    })

    setSelectedBatchId(batchId)
    setProgramId(null) // Reset program until batch details are loaded

    // Try to get program_id from the batch in the batches array immediately
    if (batchId) {
      const selectedBatch = batches.find((b) => b.id === batchId)
      if (selectedBatch) {
        const programFromBatch =
          (selectedBatch as any).program_id ||
          (selectedBatch as any).programId ||
          (selectedBatch as any).program?.id ||
          (selectedBatch as any).program?.program_id

        console.log("🔍 [Course Offering] Checking batch in array for program_id:", {
          selectedBatch,
          programFromBatch,
          batchKeys: Object.keys(selectedBatch),
        })

        if (programFromBatch) {
          console.log("✅ [Course Offering] Found program_id in batch array:", programFromBatch)
          setProgramId(programFromBatch)
        }
      }
    }
  }

  if (batchesLoading || facultyLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
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
        <h1 className="text-3xl font-bold text-gray-900">Create Course Offering</h1>
        <p className="text-gray-600 mt-2">Assign a course to a batch, semester, and instructor</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Offering Information</CardTitle>
          <CardDescription>Enter the course offering details below</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseOfferingForm
            batches={batches}
            semesters={semesters}
            courses={courses}
            faculty={faculty}
            selectedBatchId={selectedBatchId}
            programId={programId}
            onBatchChange={handleBatchChange}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/course-offerings")}
            isLoading={createMutation.isPending}
            isLoadingSemesters={semestersLoading}
            isLoadingCourses={coursesLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
