"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Plus, Edit, Trash2, Eye, ArrowUpDown, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  getAllCourses,
  deleteCourse,
  type Course,
} from "@/lib/course-service"
import { getAllPrograms, type Program } from "@/lib/program-service"

type SortField = "semester_number" | "course_code" | null
type SortDirection = "asc" | "desc"

export default function CoursesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProgramId, setSelectedProgramId] = useState<string>("all")
  const [selectedCourseType, setSelectedCourseType] = useState<string>("all")
  const [selectedSemester, setSelectedSemester] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [deleteConfirm, setDeleteConfirm] = useState<Course | null>(null)

  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin"

  // Fetch programs
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: getAllPrograms,
  })

  // Fetch courses
  const programIdFilter = selectedProgramId !== "all" ? Number.parseInt(selectedProgramId) : undefined
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["courses", programIdFilter],
    queryFn: () => getAllCourses(programIdFilter),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      toast({
        title: "Success",
        description: "Course deleted successfully",
      })
      setDeleteConfirm(null)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      })
    },
  })

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter((course) => {
      const matchesProgram = selectedProgramId === "all" || course.program_id === Number.parseInt(selectedProgramId)
      const matchesCourseType = selectedCourseType === "all" || course.course_type === selectedCourseType
      const matchesSemester = selectedSemester === "all" || course.semester_number === Number.parseInt(selectedSemester)
      const matchesSearch =
        course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.course_description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      return matchesProgram && matchesCourseType && matchesSemester && matchesSearch
    })

    // Sort
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        if (sortField === "semester_number") {
          aValue = a.semester_number
          bValue = b.semester_number
        } else {
          aValue = a.course_code
          bValue = b.course_code
        }

        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    return filtered
  }, [courses, selectedProgramId, selectedCourseType, selectedSemester, searchTerm, sortField, sortDirection])

  // Get unique course types and semesters from courses
  const courseTypes = useMemo(() => {
    const types = new Set(courses.map((c) => c.course_type).filter(Boolean))
    return Array.from(types).sort()
  }, [courses])

  const semesters = useMemo(() => {
    const sems = new Set(courses.map((c) => c.semester_number))
    return Array.from(sems).sort((a, b) => a - b)
  }, [courses])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id)
    }
  }

  const getCourseTypeBadgeVariant = (type: string) => {
    const typeLower = type.toLowerCase()
    if (typeLower.includes("core") || typeLower.includes("major")) return "default"
    if (typeLower.includes("elective")) return "secondary"
    if (typeLower.includes("lab")) return "outline"
    return "default"
  }

  if (coursesLoading || programsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-2">Manage and view all courses</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="h-4 w-4" />
            <span>{filteredAndSortedCourses.length} courses</span>
          </div>
          {isAdmin && (
            <Button onClick={() => router.push("/admin/courses/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program-filter">Filter by Program</Label>
              <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                <SelectTrigger id="program-filter">
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-type-filter">Filter by Course Type</Label>
              <Select value={selectedCourseType} onValueChange={setSelectedCourseType}>
                <SelectTrigger id="course-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {courseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester-filter">Filter by Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger id="semester-filter">
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Complete list of all courses</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAndSortedCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort("course_code")}
                      >
                        Course Code
                        {sortField === "course_code" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Credit Hours</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort("semester_number")}
                      >
                        Semester
                        {sortField === "semester_number" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Course Type</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCourses.map((course) => {
                    const program = programs.find((p) => p.id === course.program_id)
                    return (
                      <TableRow key={course.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{course.course_code}</TableCell>
                        <TableCell>{course.course_name}</TableCell>
                        <TableCell>{course.credit_hours}</TableCell>
                        <TableCell>{course.semester_number}</TableCell>
                        <TableCell>
                          <Badge variant={getCourseTypeBadgeVariant(course.course_type)}>
                            {course.course_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{program?.name || `Program ${course.program_id}`}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/courses/${course.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeleteConfirm(course)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedProgramId !== "all" || selectedCourseType !== "all" || selectedSemester !== "all"
                  ? "No courses found"
                  : "No courses yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedProgramId !== "all" || selectedCourseType !== "all" || selectedSemester !== "all"
                  ? "Try adjusting your search or filter terms"
                  : isAdmin
                    ? "Click 'Create Course' to add your first course"
                    : "Courses will appear here when they are added to the system"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the course "{deleteConfirm?.course_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

