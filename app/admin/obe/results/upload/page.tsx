"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, FileSpreadsheet, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { parseExcelWithFlexibleHeaders, type ParsedStudent } from "@/lib/excel-parser"
import { uploadBulkPLOResults } from "@/lib/obe-results-service"
import { apiFetch } from "@/lib/api-client"
import { getAllBatches, type Batch } from "@/lib/batch-service"
import { getAllCourses, type Course } from "@/lib/course-service"

export default function UploadOBEResultsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [batches, setBatches] = useState<Batch[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingBatches, setLoadingBatches] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [batchError, setBatchError] = useState<string | null>(null)
  const [courseError, setCourseError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    batchId: "",
    semester: "",
    courseCode: "",
  })

  useEffect(() => {
    fetchBatches()
    fetchCourses()
  }, [])

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true)
      setBatchError(null)

      console.log("Fetching batches from /admin/batches...") // Debug log

      const batchesData = await getAllBatches()

      console.log("Fetched batches:", batchesData) // Debug log

      // Handle different response formats
      const batchesArray = Array.isArray(batchesData) ? batchesData : []
      setBatches(batchesArray)

      if (batchesArray.length === 0) {
        console.warn("No batches found") // Debug log
      }
    } catch (error) {
      console.error("Error fetching batches:", error) // Debug log
      const errorMessage = error instanceof Error ? error.message : "Failed to load batches"
      setBatchError(errorMessage)
      toast({
        title: "Error Loading Batches",
        description: errorMessage + ". Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoadingBatches(false)
    }
  }

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true)
      setCourseError(null)

      console.log("Fetching courses from /admin/courses...") // Debug log

      const coursesData = await getAllCourses()

      console.log("Fetched courses:", coursesData) // Debug log

      // Handle different response formats
      const coursesArray = Array.isArray(coursesData) ? coursesData : []
      setCourses(coursesArray)

      if (coursesArray.length === 0) {
        console.warn("No courses found") // Debug log
      }
    } catch (error) {
      console.error("Error fetching courses:", error) // Debug log
      const errorMessage = error instanceof Error ? error.message : "Failed to load courses"
      setCourseError(errorMessage)
      toast({
        title: "Error Loading Courses",
        description: errorMessage + ". Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null)
      setParsedData([])
      setShowPreview(false)
      return
    }

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ]
    const validExtensions = [".xlsx", ".xls"]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    setParsedData([])
    setShowPreview(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleParseFile = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file first",
        variant: "destructive",
      })
      return
    }

    if (!formData.batchId || !formData.semester || !formData.courseCode) {
      toast({
        title: "Validation Error",
        description: "Please fill all form fields before parsing",
        variant: "destructive",
      })
      return
    }

    try {
      setIsParsing(true)
      const parsed = await parseExcelWithFlexibleHeaders(selectedFile)
      setParsedData(parsed)
      setShowPreview(true)
      toast({
        title: "File parsed successfully",
        description: `Found ${parsed.length} student records`,
      })
    } catch (error) {
      toast({
        title: "Failed to parse file",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
      setParsedData([])
      setShowPreview(false)
    } finally {
      setIsParsing(false)
    }
  }

  const handleCancel = () => {
    setParsedData([])
    setShowPreview(false)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleApproveAndSubmit = async () => {
    if (!parsedData || parsedData.length === 0) {
      toast({
        title: "No data to submit",
        description: "Please parse the file first",
        variant: "destructive",
      })
      return
    }

    if (!formData.batchId || !formData.courseCode) {
      toast({
        title: "Validation Error",
        description: "Please select batch and course before submitting",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare payload in exact format backend expects
      const payload = {
        course_code: formData.courseCode,
        batch_id: parseInt(formData.batchId), // Convert string to number
        students: parsedData.map((student) => ({
          roll_no: student.roll_no,
          student_name: student.student_name,
          plo1: student.plo1 ?? null,
          plo2: student.plo2 ?? null,
          plo3: student.plo3 ?? null,
          plo4: student.plo4 ?? null,
          plo5: student.plo5 ?? null,
          plo6: student.plo6 ?? null,
          plo7: student.plo7 ?? null,
          plo8: student.plo8 ?? null,
          plo9: student.plo9 ?? null,
          plo10: student.plo10 ?? null,
          plo11: student.plo11 ?? null,
          plo12: student.plo12 ?? null,
        })),
      }

      console.log("Submitting payload to /api/plo/upload-bulk:", payload) // Debug log

      const result = await uploadBulkPLOResults(payload)

      console.log("Upload success response:", result) // Debug log

      const insertedCount = result.inserted_count || parsedData.length

      toast({
        title: "Success",
        description: `✅ Successfully uploaded results for ${insertedCount} students!`,
      })

      // Reset form and preview
      setFormData({ batchId: "", semester: "", courseCode: "" })
      setSelectedFile(null)
      setParsedData([])
      setShowPreview(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Redirect to results page after 2 seconds
      setTimeout(() => {
        router.push("/admin/obe/results")
      }, 2000)
    } catch (error) {
      console.error("Upload error:", error) // Debug log

      let errorMessage = "Failed to upload results. Please try again."
      if (error instanceof Error) {
        errorMessage = error.message
        // Handle specific error cases
        if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          errorMessage = "Authentication failed. Please log in again."
        } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
          errorMessage = "You don't have permission to upload results."
        } else if (error.message.includes("404")) {
          errorMessage = "API endpoint not found. Please contact administrator."
        } else if (error.message.includes("500") || error.message.includes("Internal Server")) {
          errorMessage = "Server error. Please try again later."
        }
      }

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    return formData.batchId && formData.semester && formData.courseCode && selectedFile
  }

  const isParseReady = () => {
    return (
      isFormValid() &&
      !isParsing &&
      !isSubmitting &&
      !loadingBatches &&
      !loadingCourses &&
      batches.length > 0 &&
      courses.length > 0
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/obe/results">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload OBE Results</h1>
          <p className="text-gray-600 mt-1">Upload Excel file with student PLO attainment data</p>
        </div>
      </div>

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>Results Upload Form</CardTitle>
          <CardDescription>Select batch, semester, course, and upload Excel file</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Batch Selection */}
              <div className="space-y-2">
                <Label htmlFor="batch">Batch *</Label>
                <Select
                  value={formData.batchId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, batchId: value }))}
                  disabled={loadingBatches || isSubmitting}
                >
                  <SelectTrigger id="batch">
                    <SelectValue
                      placeholder={
                        loadingBatches
                          ? "Loading batches..."
                          : batchError
                          ? "Error loading batches"
                          : batches.length === 0
                          ? "No batches available"
                          : "Select batch"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingBatches ? (
                      <div className="p-2 text-sm text-gray-500">Loading batches...</div>
                    ) : batches.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">No batches available</div>
                    ) : (
                      batches.map((batch) => {
                        // Handle different batch name formats from API
                        const batchName =
                          (batch as any).batchName || batch.name || `Batch ${batch.year || batch.id}`
                        const displayText = batch.year ? `${batchName} (${batch.year})` : batchName
                        return (
                          <SelectItem key={batch.id} value={String(batch.id)}>
                            {displayText}
                          </SelectItem>
                        )
                      })
                    )}
                  </SelectContent>
                </Select>
                {batchError && (
                  <p className="text-xs text-red-500 mt-1">{batchError}</p>
                )}
                {!loadingBatches && !batchError && batches.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No batches found. Please add batches first.</p>
                )}
              </div>

              {/* Semester Selection */}
              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={String(sem)}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course Code Selection */}
              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code *</Label>
                <Select
                  value={formData.courseCode}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, courseCode: value }))}
                  disabled={loadingCourses || isSubmitting}
                >
                  <SelectTrigger id="courseCode">
                    <SelectValue
                      placeholder={
                        loadingCourses
                          ? "Loading courses..."
                          : courseError
                          ? "Error loading courses"
                          : courses.length === 0
                          ? "No courses available"
                          : "Select course"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {loadingCourses ? (
                      <div className="p-2 text-sm text-gray-500">Loading courses...</div>
                    ) : courses.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">No courses available</div>
                    ) : (
                      courses.map((course) => {
                        // Handle different course code/name formats from API
                        const courseCode = course.course_code || (course as any).code || ""
                        const courseName = course.course_name || (course as any).name || ""
                        const displayText = courseName ? `${courseCode} - ${courseName}` : courseCode

                        return (
                          <SelectItem key={course.id} value={courseCode}>
                            <div className="flex flex-col">
                              <span className="font-medium">{courseCode}</span>
                              {courseName && <span className="text-xs text-gray-500">{courseName}</span>}
                            </div>
                          </SelectItem>
                        )
                      })
                    )}
                  </SelectContent>
                </Select>
                {courseError && (
                  <p className="text-xs text-red-500 mt-1">{courseError}</p>
                )}
                {!loadingCourses && !courseError && courses.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No courses found. Please add courses first.</p>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <Label>Excel File *</Label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  selectedFile ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  disabled={isSubmitting}
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <FileSpreadsheet className="h-12 w-12 text-blue-600 mx-auto" />
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFileSelect(null)
                      }}
                      className="mt-2"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-900 font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500 mt-1">Excel files only (.xlsx, .xls) • Max 5MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Parse Button */}
            <Button
              type="button"
              onClick={handleParseFile}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!isParseReady()}
            >
              {isParsing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing Excel File...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Parse Excel File
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Parsed Data Preview
                </CardTitle>
                <CardDescription className="mt-2">
                  Review the extracted data before submitting
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">⚠️ Check if parsing is correct</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>{parsedData.length}</strong> student records parsed successfully. Ready to submit.
                </p>
              </div>

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Seat No</TableHead>
                        <TableHead>Student Name</TableHead>
                        {Array.from({ length: 12 }, (_, i) => (
                          <TableHead key={i + 1} className="text-center">
                            PLO-{i + 1}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.map((student, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-mono">{student.roll_no}</TableCell>
                          <TableCell>{student.student_name}</TableCell>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((ploNum) => {
                            const ploKey = `plo${ploNum}` as keyof ParsedStudent
                            const value = student[ploKey] as number | null
                            return (
                              <TableCell key={ploNum} className="text-center">
                                {value !== null ? (
                                  <span className="font-medium">{value.toFixed(2)}</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApproveAndSubmit}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting || parsedData.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve & Submit to Backend
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

