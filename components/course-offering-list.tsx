"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, BookOpen, User, Calendar } from "lucide-react"
import { type CourseOffering, type CourseOfferingFilters } from "@/lib/course-offering-service"
import { type Batch } from "@/lib/batch-service"
import { getSemestersByBatch } from "@/lib/course-offering-service"
import { getActiveFaculty } from "@/lib/course-offering-service"

interface Semester {
  id: number
  number: number
  status?: string
  batch_id?: number
}

interface Faculty {
  id: number
  name: string
  email: string
}

interface CourseOfferingListProps {
  offerings: CourseOffering[]
  batches: Batch[]
  onFiltersChange: (filters: CourseOfferingFilters) => void
  filters: CourseOfferingFilters
  isLoading?: boolean
  totalPages?: number
  currentPage?: number
  onPageChange?: (page: number) => void
}

export function CourseOfferingList({
  offerings,
  batches,
  onFiltersChange,
  filters,
  isLoading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
}: CourseOfferingListProps) {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loadingSemesters, setLoadingSemesters] = useState(false)
  const [loadingFaculty, setLoadingFaculty] = useState(false)

  // Fetch semesters when batch filter changes
  useEffect(() => {
    if (filters.batch_id) {
      fetchSemesters(filters.batch_id)
    } else {
      setSemesters([])
    }
  }, [filters.batch_id])

  // Fetch faculty on mount
  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchSemesters = async (batchId: number) => {
    try {
      setLoadingSemesters(true)
      const data = await getSemestersByBatch(batchId)
      setSemesters(data)
    } catch (error) {
      console.error("Error fetching semesters:", error)
      setSemesters([])
    } finally {
      setLoadingSemesters(false)
    }
  }

  const fetchFaculty = async () => {
    try {
      setLoadingFaculty(true)
      const data = await getActiveFaculty()
      setFaculty(data)
    } catch (error) {
      console.error("Error fetching faculty:", error)
      setFaculty([])
    } finally {
      setLoadingFaculty(false)
    }
  }

  const handleBatchChange = (batchId: string) => {
    const batchIdNum = batchId === "all" ? undefined : Number.parseInt(batchId)
    onFiltersChange({
      ...filters,
      batch_id: batchIdNum,
      semester_id: undefined, // Reset semester when batch changes
      page: 1,
    })
  }

  const handleSemesterChange = (semesterId: string) => {
    const semesterIdNum = semesterId === "all" ? undefined : Number.parseInt(semesterId)
    onFiltersChange({
      ...filters,
      semester_id: semesterIdNum,
      page: 1,
    })
  }

  const handleInstructorChange = (instructorId: string) => {
    const instructorIdNum = instructorId === "all" ? undefined : Number.parseInt(instructorId)
    onFiltersChange({
      ...filters,
      instructor_id: instructorIdNum,
      page: 1,
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "N/A"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter course offerings by batch, semester, or instructor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Batch</label>
              <Select
                value={filters.batch_id?.toString() || "all"}
                onValueChange={handleBatchChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id.toString()}>
                      {batch.name} ({batch.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <Select
                value={filters.semester_id?.toString() || "all"}
                onValueChange={handleSemesterChange}
                disabled={!filters.batch_id || loadingSemesters}
              >
                <SelectTrigger>
                  {loadingSemesters ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder={filters.batch_id ? "All semesters" : "Select batch first"} />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All semesters</SelectItem>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id.toString()}>
                      Semester {semester.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Instructor</label>
              <Select
                value={filters.instructor_id?.toString() || "all"}
                onValueChange={handleInstructorChange}
                disabled={loadingFaculty}
              >
                <SelectTrigger>
                  {loadingFaculty ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="All instructors" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All instructors</SelectItem>
                  {faculty.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id.toString()}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Course Offerings</CardTitle>
          <CardDescription>List of all course offerings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading course offerings...</p>
              </div>
            </div>
          ) : offerings.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Created Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offerings.map((offering) => (
                      <TableRow key={offering.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                {offering.course?.course_code || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {offering.course?.course_name || "N/A"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {offering.semester?.number || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {offering.batch?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                {offering.instructor?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {offering.instructor?.email || "N/A"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {formatDate(offering.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && onPageChange && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No course offerings found</h3>
              <p className="text-gray-600">
                {Object.values(filters).some((v) => v !== undefined && v !== null)
                  ? "Try adjusting your filters"
                  : "No course offerings have been created yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
