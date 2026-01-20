"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, GraduationCap, ArrowRight, Eye, Loader2, Calendar, Users } from "lucide-react"
import {
  getCourseOfferingsWithResults,
  getDetailedCourseOfferingResult,
  type CourseOfferingWithResults,
  type DetailedCourseOfferingResult,
} from "@/lib/obe-results-service"

export default function OBEResultsPage() {
  const [courseOfferings, setCourseOfferings] = useState<CourseOfferingWithResults[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOffering, setSelectedOffering] = useState<CourseOfferingWithResults | null>(null)
  const [detailedData, setDetailedData] = useState<DetailedCourseOfferingResult | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourseOfferings()
  }, [])

  const fetchCourseOfferings = async () => {
    try {
      setLoading(true)
      const data = await getCourseOfferingsWithResults()
      setCourseOfferings(data)
    } catch (error) {
      console.error("Error fetching course offerings:", error)
      if (error instanceof Error && !error.message.includes("404")) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch course offerings with results",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = async (offering: CourseOfferingWithResults) => {
    setSelectedOffering(offering)
    setIsModalOpen(true)
    setLoadingDetails(true)
    setDetailedData(null)

    try {
      const data = await getDetailedCourseOfferingResult(offering.course_offering_id)
      setDetailedData(data)
    } catch (error) {
      console.error("Error fetching detailed results:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch detailed results",
        variant: "destructive",
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">OBE Results Management</h1>
          <p className="text-gray-600 mt-2">Upload and manage course OBE results</p>
        </div>
        <Link href="/admin/obe/results/upload">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" />
            Upload Results
          </Button>
        </Link>
      </div>

      {/* Upload Results Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload New Results
          </CardTitle>
          <CardDescription>Upload Excel file with student PLO attainment data</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/obe/results/upload">
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Go to Upload Page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Course Offerings with Results Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Offerings with Results</h2>
        <p className="text-gray-600 mb-6">Click on a row to view detailed student results</p>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : courseOfferings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg mb-2">No results uploaded yet</p>
              <p className="text-gray-500 text-sm mb-4">Upload your first batch of results to get started</p>
              <Link href="/admin/obe/results/upload">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Results
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead className="text-center">Students</TableHead>
                      <TableHead>Last Upload</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseOfferings.map((offering) => (
                      <TableRow
                        key={offering.course_offering_id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRowClick(offering)}
                      >
                        <TableCell className="font-mono font-semibold">
                          {offering.course.course_code}
                        </TableCell>
                        <TableCell>{offering.course.course_name}</TableCell>
                        <TableCell>{offering.batch.name}</TableCell>
                        <TableCell>Semester {offering.semester.number}</TableCell>
                        <TableCell>{offering.instructor?.name || "N/A"}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            {offering.summary.student_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          {offering.summary.last_upload_date ? (
                            <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {formatDate(offering.summary.last_upload_date)}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRowClick(offering)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Results Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedOffering && (
                <>
                  {selectedOffering.course.course_code} - {selectedOffering.course.course_name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedOffering && (
                <>
                  Batch: {selectedOffering.batch.name} • Semester {selectedOffering.semester.number}
                  {selectedOffering.instructor && ` • Instructor: ${selectedOffering.instructor.name}`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading detailed results...</span>
            </div>
          ) : detailedData ? (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Students</p>
                        <p className="font-semibold text-gray-900">{detailedData.summary.total_students}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">First Upload</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(detailedData.summary.first_upload_date)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Last Upload</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(detailedData.summary.last_upload_date)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Students Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Student Name</TableHead>
                        {Array.from({ length: 12 }, (_, i) => (
                          <TableHead key={i + 1} className="text-center">
                            PLO-{i + 1}
                          </TableHead>
                        ))}
                        <TableHead>Upload Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedData.students.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={16} className="text-center text-gray-500 py-8">
                            No student results found
                          </TableCell>
                        </TableRow>
                      ) : (
                        detailedData.students.map((student, index) => (
                          <TableRow key={student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-mono">{student.roll_no}</TableCell>
                            <TableCell>{student.student_name}</TableCell>
                            <TableCell className="text-center">
                              {student.plo1 !== null ? (
                                <span className="font-medium">{student.plo1.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {student.plo2 !== null ? (
                                <span className="font-medium">{student.plo2.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {student.plo3 !== null ? (
                                <span className="font-medium">{student.plo3.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {student.plo4 !== null ? (
                                <span className="font-medium">{student.plo4.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {student.plo5 !== null ? (
                                <span className="font-medium">{student.plo5.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {student.plo6 !== null ? (
                                <span className="font-medium">{student.plo6.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {student.plo7 !== null ? (
                                <span className="font-medium">{student.plo7.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {student.plo8 !== null ? (
                                <span className="font-medium">{student.plo8.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {student.plo9 !== null ? (
                                <span className="font-medium">{student.plo9.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {student.plo10 !== null ? (
                                <span className="font-medium">{student.plo10.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {student.plo11 !== null ? (
                                <span className="font-medium">{student.plo11.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {student.plo12 !== null ? (
                                <span className="font-medium">{student.plo12.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatDate(student.upload_timestamp)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No detailed data available</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

