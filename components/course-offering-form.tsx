"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { type CreateCourseOfferingDto } from "@/lib/course-offering-service"
import { type Batch } from "@/lib/batch-service"
interface Semester {
  id: number
  number: number
  status?: string
  batch_id?: number
}
import { type Course } from "@/lib/course-service"
import { Loader2 } from "lucide-react"
import { log } from "console"

const courseOfferingSchema = z.object({
  // batch_id: z.number().min(1, "Batch is required"),
  semester_id: z.number().min(1, "Semester is required"),
  course_id: z.number().min(1, "Course is required"),
  instructor_id: z.number().min(1, "Instructor is required"),
})

type CourseOfferingFormValues = z.infer<typeof courseOfferingSchema>

interface Faculty {
  id?: number
  _id?: number
  faculty_id?: number
  facultyProfileId?: number
  primaryId?: number // Mapped primary key
  originalId?: number // Original id (might be user_id)
  userId?: number
  user_id?: number
  name: string
  email: string
  status?: string
  isActive?: boolean
}

interface CourseOfferingFormProps {
  batches: Batch[]
  semesters: Semester[]
  courses: Course[]
  faculty: Faculty[]
  selectedBatchId: number | null
  programId: number | null
  onBatchChange: (batchId: number | null) => void
  onSubmit: (data: CreateCourseOfferingDto) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  isLoadingSemesters?: boolean
  isLoadingCourses?: boolean
}

export function CourseOfferingForm({
  batches,
  semesters,
  courses,
  faculty,
  selectedBatchId,
  programId,
  onBatchChange,
  onSubmit,
  onCancel,
  isLoading = false,
  isLoadingSemesters = false,
  isLoadingCourses = false,
}: CourseOfferingFormProps) {
  const form = useForm<CourseOfferingFormValues>({
    resolver: zodResolver(courseOfferingSchema),
    defaultValues: {
      // batch_id: 0,
      semester_id: 0,
      course_id: 0,
      instructor_id: 0,
    },
  })

  // Reset semester and course when batch changes
  const handleBatchChange = (batchId: string) => {
    const batchIdNum = batchId === "" ? null : Number.parseInt(batchId)
    form.setValue("semester_id", 0)
    form.setValue("course_id", 0)
    onBatchChange(batchIdNum)
  }

  // Filter courses by program
  const filteredCourses = programId
    ? courses.filter((course) => course.program_id === programId)
    : []

  // Log filtered courses
  useEffect(() => {
    console.log("📝 [Course Offering Form] Form state:", {
      programId,
      selectedBatchId,
      coursesCount: courses.length,
      filteredCoursesCount: filteredCourses.length,
      filteredCourses: filteredCourses.map((c) => ({
        id: c.id,
        code: c.course_code,
        name: c.course_name,
        program_id: c.program_id,
      })),
      isCourseDisabled: !programId || isLoadingCourses,
      isLoadingCourses,
    })
  }, [programId, selectedBatchId, courses, filteredCourses, isLoadingCourses])

  const handleSubmit = async (data: CourseOfferingFormValues) => {
    // Only send semester_id, course_id, and instructor_id
    // batch_id is not needed - backend derives it from semester_id

    console.log("📝 [Course Offering Form] Data:", data)
    const submitData = {
      course_id: data.course_id,
      semester_id: data.semester_id,
      instructor_id: data.instructor_id,
    }
    
    console.log("📤 [Course Offering Form] Submitting:", {
      submitData,
      formData: data,
      selectedBatchId,
      note: "batch_id not included - backend derives from semester_id",
    })
    
    await onSubmit(submitData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Batch selection is only for filtering semesters, not part of form submission */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Batch *</label>
          <Select
            onValueChange={handleBatchChange}
            value={selectedBatchId ? selectedBatchId.toString() : undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a batch" />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id.toString()}>
                  {batch.name} ({batch.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Select the batch to filter available semesters (batch is derived from semester)
          </p>
        </div>

        <FormField
          control={form.control}
          name="semester_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semester *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number.parseInt(value) || 0)}
                value={field.value > 0 ? field.value.toString() : ""}
                disabled={!selectedBatchId || isLoadingSemesters}
              >
                <FormControl>
                  <SelectTrigger>
                    {isLoadingSemesters ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading semesters...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Select a semester" />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {semesters.length > 0 ? (
                    semesters.map((semester) => (
                      <SelectItem
                        key={semester.id}
                        value={semester.id.toString()}
                      >
                        Semester {semester.number}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No semesters available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                {selectedBatchId
                  ? "Select the semester for this course offering"
                  : "Please select a batch first"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="course_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course *</FormLabel>
              <Select
                onValueChange={(value) => {
                  const courseId = Number.parseInt(value) || 0
                  console.log("📝 [Course Offering Form] Course selected:", {
                    value,
                    courseId,
                    selectedCourse: courses.find((c) => c.id === courseId),
                  })
                  field.onChange(courseId)
                }}
                value={field.value > 0 ? field.value.toString() : ""}
                disabled={!programId || isLoadingCourses}
              >
                <FormControl>
                  <SelectTrigger>
                    {isLoadingCourses ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading courses...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Select a course" />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.course_code} - {course.course_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      {programId
                        ? "No courses available for this program"
                        : "Please select a batch first"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                {programId
                  ? `Select the course to offer (filtered by batch's program). ${filteredCourses.length} course(s) available.`
                  : selectedBatchId
                    ? "Loading program information or batch does not have a program assigned..."
                    : "Please select a batch first"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instructor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructor *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number.parseInt(value) || 0)}
                value={field.value > 0 ? field.value.toString() : ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an instructor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {faculty.length > 0 ? (
                    faculty.map((instructor) => {
                      // Use primary key (faculty table primary key, not user_id)
                      // Priority: primaryId (mapped) > faculty_id > facultyProfileId > id > _id
                      const instructorId =
                        instructor.primaryId ||
                        instructor.faculty_id ||
                        instructor.facultyProfileId ||
                        instructor.id ||
                        instructor._id

                      console.log("📝 [Course Offering Form] Instructor mapping:", {
                        instructor,
                        instructorId,
                        userId: instructor.user_id || instructor.userId,
                        note: "Using primary key of faculty table, not user_id",
                      })

                      return (
                        <SelectItem key={instructorId} value={instructorId?.toString() || ""}>
                          {instructor.name} ({instructor.email})
                        </SelectItem>
                      )
                    })
                  ) : (
                    <SelectItem value="none" disabled>
                      No active faculty available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>Select the instructor for this course offering</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Course Offering"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
