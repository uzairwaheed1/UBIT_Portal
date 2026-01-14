"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  BookOpen,
  Download,
  Search,
  Calendar,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { getCourseResultDetail, type CourseResultDetail } from "@/lib/obe-results-service"
import * as XLSX from "xlsx"

type SortField = "seat_no" | "student_name" | `plo${number}` | null
type SortDirection = "asc" | "desc"

export default function CourseResultDetailPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params.batchId as string
  const courseCode = decodeURIComponent(params.courseCode as string)
  const { toast } = useToast()

  const [data, setData] = useState<CourseResultDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const rowsPerPage = 20

  useEffect(() => {
    if (batchId && courseCode) {
      fetchCourseDetail()
    }
  }, [batchId, courseCode])

  const fetchCourseDetail = async () => {
    try {
      setLoading(true)
      const result = await getCourseResultDetail(batchId, courseCode)
      setData(result)
    } catch (error) {
      console.error("Error fetching course detail:", error)
      // Don't show error toast if it's a 404 - backend might not be implemented yet
      if (error instanceof Error && !error.message.includes("404")) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch course details",
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

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    if (!data) return []

    let students = [...data.students]

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      students = students.filter(
        (student) =>
          student.seat_no.toLowerCase().includes(term) ||
          student.student_name.toLowerCase().includes(term),
      )
    }

    // Sort
    if (sortField) {
      students.sort((a, b) => {
        let aValue: any
        let bValue: any

        if (sortField === "seat_no") {
          aValue = a.seat_no
          bValue = b.seat_no
        } else if (sortField === "student_name") {
          aValue = a.student_name
          bValue = b.student_name
        } else if (sortField.startsWith("plo")) {
          const ploNum = parseInt(sortField.replace("plo", ""))
          const ploKey = `plo${ploNum}_value` as keyof typeof a
          aValue = a[ploKey] ?? null
          bValue = b[ploKey] ?? null
        }

        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        if (typeof aValue === "string") {
          return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        } else {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue
        }
      })
    }

    return students
  }, [data, searchTerm, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedStudents.length / rowsPerPage)
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredAndSortedStudents.slice(start, end)
  }, [filteredAndSortedStudents, currentPage, rowsPerPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const handleExport = () => {
    if (!data || filteredAndSortedStudents.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available to export",
        variant: "destructive",
      })
      return
    }

    try {
      // Create workbook
      const workbook = XLSX.utils.book_new()

      // Create worksheet data
      const headers = [
        "#",
        "Seat No",
        "Name of Student",
        ...Array.from({ length: 12 }, (_, i) => `PLO-${i + 1}`),
      ]

      const rows = filteredAndSortedStudents.map((student, index) => [
        index + 1,
        student.seat_no,
        student.student_name,
        student.plo1_value !== null ? student.plo1_value.toFixed(2) : "",
        student.plo2_value !== null ? student.plo2_value.toFixed(2) : "",
        student.plo3_value !== null ? student.plo3_value.toFixed(2) : "",
        student.plo4_value !== null ? student.plo4_value.toFixed(2) : "",
        student.plo5_value !== null ? student.plo5_value.toFixed(2) : "",
        student.plo6_value !== null ? student.plo6_value.toFixed(2) : "",
        student.plo7_value !== null ? student.plo7_value.toFixed(2) : "",
        student.plo8_value !== null ? student.plo8_value.toFixed(2) : "",
        student.plo9_value !== null ? student.plo9_value.toFixed(2) : "",
        student.plo10_value !== null ? student.plo10_value.toFixed(2) : "",
        student.plo11_value !== null ? student.plo11_value.toFixed(2) : "",
        student.plo12_value !== null ? student.plo12_value.toFixed(2) : "",
      ])

      const worksheetData = [headers, ...rows]
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Results")

      // Generate filename
      const filename = `${courseCode}_results_${new Date().toISOString().split("T")[0]}.xlsx`

      // Write file
      XLSX.writeFile(workbook, filename)

      toast({
        title: "Export Successful",
        description: `Course results exported to ${filename}`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export results",
        variant: "destructive",
      })
    }
  }

  const getPLOColorClass = (value: number | null): string => {
    if (value === null || value === undefined) return "text-gray-400"
    if (value >= 70) return "text-green-600 font-semibold" // Achieved
    if (value >= 50) return "text-yellow-600 font-semibold" // Partial
    return "text-red-600 font-semibold" // Not achieved
  }

  const getPLOBadge = (value: number | null) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>
    }
    const colorClass = getPLOColorClass(value)
    return <span className={colorClass}>{value.toFixed(2)}</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/obe/results/${batchId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          {loading ? (
            <Skeleton className="h-9 w-96 mb-2" />
          ) : data ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                {data.metadata.course_code} - {data.metadata.course_name}
              </h1>
              <p className="text-gray-600 mt-1">Course OBE Results Detail</p>
            </>
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">Course Results</h1>
          )}
        </div>
        {!loading && data && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        )}
      </div>

      {/* Metadata Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Batch</p>
                  <p className="font-semibold text-gray-900">{data.metadata.batch_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Semester</p>
                  <p className="font-semibold text-gray-900">Semester {data.metadata.semester}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="font-semibold text-gray-900">{data.metadata.total_students}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Upload Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(data.metadata.uploaded_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Results</CardTitle>
              <CardDescription>PLO attainment values for all students</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by seat no or name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data ? (
            <div className="text-center py-12 text-gray-500">No data available</div>
          ) : (
            <div className="space-y-4">
              {/* Table */}
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 cursor-pointer" onClick={() => handleSort(null)}>
                        #
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("seat_no")}
                      >
                        Seat No
                        {sortField === "seat_no" && (
                          <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("student_name")}
                      >
                        Student Name
                        {sortField === "student_name" && (
                          <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </TableHead>
                      {Array.from({ length: 12 }, (_, i) => {
                        const ploNum = i + 1
                        const ploField = `plo${ploNum}` as SortField
                        return (
                          <TableHead
                            key={ploNum}
                            className="text-center cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort(ploField)}
                          >
                            PLO-{ploNum}
                            {sortField === ploField && (
                              <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={15} className="text-center text-gray-500 py-8">
                          No students found matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedStudents.map((student, index) => {
                        const globalIndex = (currentPage - 1) * rowsPerPage + index + 1
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{globalIndex}</TableCell>
                            <TableCell className="font-mono">{student.seat_no}</TableCell>
                            <TableCell>{student.student_name}</TableCell>
                            <TableCell className="text-center">{getPLOBadge(student.plo1_value)}</TableCell>
                            <TableCell className="text-center">{getPLOBadge(student.plo2_value)}</TableCell>
                            <TableCell className="text-center">{getPLOBadge(student.plo3_value)}</TableCell>
                            <TableCell className="text-center">{getPLOBadge(student.plo4_value)}</TableCell>
                            <TableCell className="text-center">{getPLOBadge(student.plo5_value)}</TableCell>
                            <TableCell className="text-center">{getPLOBadge(student.plo6_value)}</TableCell>
                            <TableCell className="text-center">{getPLOBadge(student.plo7_value)}</TableCell>
                            <TableCell className="text-center">{getPLOBadge(student.plo8_value)}</TableCell>
                            <TableCell className="text-center">{getPLOBadge(student.plo9_value)}</TableCell>
                            <TableCell className="text-center">{getPLOBadge(student.plo10_value)}</TableCell>
                            <TableCell className="text-center">{getPLOBadge(student.plo11_value)}</TableCell>
                            <TableCell className="text-center">{getPLOBadge(student.plo12_value)}</TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(currentPage * rowsPerPage, filteredAndSortedStudents.length)} of{" "}
                    {filteredAndSortedStudents.length} students
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 text-sm border-t pt-4">
                <span className="font-medium">Color Coding:</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ≥70% (Achieved)
                </Badge>
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  50-69% (Partial)
                </Badge>
                <Badge variant="outline" className="text-red-600 border-red-600">
                  &lt;50% (Not Achieved)
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

