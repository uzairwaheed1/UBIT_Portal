"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { type Course, type CreateCourseDto, type UpdateCourseDto } from "@/lib/course-service"
import { type Program } from "@/lib/program-service"

const courseSchema = z.object({
  course_code: z
    .string()
    .min(1, "Course code is required")
    .max(50, "Course code must be 50 characters or less"),
  course_name: z
    .string()
    .min(1, "Course name is required")
    .max(255, "Course name must be 255 characters or less"),
  course_description: z.string().optional(),
  credit_hours: z
    .number()
    .min(0.5, "Credit hours must be at least 0.5")
    .max(6.0, "Credit hours must be at most 6.0")
    .step(0.5, "Credit hours must be in increments of 0.5"),
  program_id: z.number().min(1, "Program is required"),
  semester_number: z.number().min(1, "Semester must be at least 1").max(8, "Semester must be at most 8"),
  course_type: z.string().min(1, "Course type is required"),
})

type CourseFormValues = z.infer<typeof courseSchema>

interface CourseFormProps {
  programs: Program[]
  initialData?: Course
  onSubmit: (data: CreateCourseDto | UpdateCourseDto) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

const courseTypes = [
  "Core Course",
  "Major Course",
  "Elective Course",
  "General Course",
  "Lab Course",
  "Project Course",
  "Thesis",
]

export function CourseForm({
  programs,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: CourseFormProps) {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData
      ? {
          course_code: initialData.course_code,
          course_name: initialData.course_name,
          course_description: initialData.course_description || "",
          credit_hours: initialData.credit_hours,
          program_id: initialData.program_id,
          semester_number: initialData.semester_number,
          course_type: initialData.course_type,
        }
      : {
          course_code: "",
          course_name: "",
          course_description: "",
          credit_hours: 3.0,
          program_id: 0,
          semester_number: 1,
          course_type: "",
        },
  })

  const handleSubmit = async (data: CourseFormValues) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="course_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Code *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., CS101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Data Structures" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="course_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter course description..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>Optional description of the course</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="credit_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credit Hours *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="6.0"
                    placeholder="e.g., 3.0"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Between 0.5 and 6.0</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="semester_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number.parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="program_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number.parseInt(value))}
                value={field.value > 0 ? field.value.toString() : ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name} ({program.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            {isLoading ? "Saving..." : initialData ? "Update Course" : "Create Course"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

