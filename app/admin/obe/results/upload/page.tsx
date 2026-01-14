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
import { apiFetch } from "@/lib/api-client"
import { getAllPrograms, type Program } from "@/lib/program-service"
import { getAllBatches, type Batch } from "@/lib/batch-service"
import { getSemestersByBatch } from "@/lib/course-offering-service"
import { getCourseOfferings, type CourseOffering } from "@/lib/course-offering-service"

export default function UploadOBEResultsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cascading dropdown states
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null)
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null)
  const [semesters, setSemesters] = useState<any[]>([])
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null)
  const [courseOfferings, setCourseOfferings] = useState<CourseOffering[]>([])
  const [selectedCourseOfferingId, setSelectedCourseOfferingId] = useState<number | null>(null)

  // Loading states
  const [loadingPrograms, setLoadingPrograms] = useState(true)
  const [loadingBatches, setLoadingBatches] = useState(false)
  const [loadingSemesters, setLoadingSemesters] = useState(false)
  const [loadingCourseOfferings, setLoadingCourseOfferings] = useState(false)

  // File upload states
  const [isParsing, setIsParsing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([])
  const [showPreview, setShowPreview] = useState(false)

  // Fetch programs on mount
  useEffect(() => {
    fetchPrograms()
  }, [])

  // Fetch batches when program changes
  useEffect(() => {
    if (selectedProgramId) {
      fetchBatchesByProgram(selectedProgramId)
    } else {
      setBatches([])
      setSelectedBatchId(null)
    }
  }, [selectedProgramId])

  // Fetch semesters when batch changes
  useEffect(() => {
    if (selectedBatchId) {
      fetchSemestersByBatch(selectedBatchId)
    } else {
      setSemesters([])
      setSelectedSemesterId(null)
    }
  }, [selectedBatchId])

  // Fetch course offerings when both batch and semester are selected
  useEffect(() => {
    if (selectedBatchId && selectedSemesterId) {
      fetchCourseOfferingsByBatchAndSemester(selectedBatchId, selectedSemesterId)
    } else {
      setCourseOfferings([])
      setSelectedCourseOfferingId(null)
    }
  }, [selectedBatchId, selectedSemesterId])

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true)
      const programsData = await getAllPrograms()
      setPrograms(Array.isArray(programsData) ? programsData : [])
    } catch (error) {
      console.error("Error fetching programs:", error)
      toast({
        title: "Error",
        description: "Failed to load programs",
        variant: "destructive",
      })
    } finally {
      setLoadingPrograms(false)
    }
  }

  const fetchBatchesByProgram = async (programId: number) => {
    try {
      setLoadingBatches(true)
      const allBatches = await getAllBatches()
      const filteredBatches = allBatches.filter(
        (batch) => batch.program_id === programId
      )
      setBatches(filteredBatches)
      if (filteredBatches.length === 0) {
        toast({
          title: "No batches found",
          description: "No batches found for the selected program",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error fetching batches:", error)
      toast({
        title: "Error",
        description: "Failed to load batches",
        variant: "destructive",
      })
    } finally {
      setLoadingBatches(false)
    }
  }

  const fetchSemestersByBatch = async (batchId: number) => {
    try {
      setLoadingSemesters(true)
      console.log(`📤 [OBE Upload] Fetching semesters for batch ${batchId}...`)
      
      const semestersData = await getSemestersByBatch(batchId)
      console.log(`📥 [OBE Upload] Received semesters:`, semestersData)
      
      // Filter: only active and unlocked semesters
      // const activeUnlockedSemesters = semestersData.filter(
      //   (sem: any) => sem.is_active === true && sem.is_locked === false
      // )
      
      // console.log(`✅ [OBE Upload] Filtered ${activeUnlockedSemesters.length} active, unlocked semesters`)
      setSemesters(semestersData)
      
      // if (activeUnlockedSemesters.length === 0 && semestersData.length > 0) {
      //   toast({
      //     title: "No active semesters",
      //     description: `${semestersData.length} semester(s) found, but none are active and unlocked`,
      //     variant: "default",
      //   })
      // } else if (activeUnlockedSemesters.length === 0) {
      //   toast({
      //     title: "No semesters found",
      //     description: "No semesters found for this batch",
      //     variant: "default",
      //   })
      // }
    } catch (error) {
      console.error("❌ [OBE Upload] Error fetching semesters:", error)
      setSemesters([])
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load semesters",
        variant: "destructive",
      })
    } finally {
      setLoadingSemesters(false)
    }
  }

  const fetchCourseOfferingsByBatchAndSemester = async (batchId: number, semesterId: number) => {
    try {
      setLoadingCourseOfferings(true)
      const response = await apiFetch(`/admin/course-offerings/batch/${batchId}/semester/${semesterId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch course offerings")
      }
      const result = await response.json()
      const offerings = result.data || result || []
      setCourseOfferings(Array.isArray(offerings) ? offerings : [])
    } catch (error) {
      console.error("Error fetching course offerings:", error)
      setCourseOfferings([])
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load course offerings",
        variant: "destructive",
      })
    } finally {
      setLoadingCourseOfferings(false)
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

  const handleProgramChange = (programId: string) => {
    const id = programId === "none" ? null : parseInt(programId)
    setSelectedProgramId(id)
    setSelectedBatchId(null)
    setSelectedSemesterId(null)
    setSelectedCourseOfferingId(null)
  }

  const handleBatchChange = (batchId: string) => {
    const id = batchId === "none" ? null : parseInt(batchId)
    setSelectedBatchId(id)
    setSelectedSemesterId(null)
    setSelectedCourseOfferingId(null)
  }

  const handleSemesterChange = (semesterId: string) => {
    const id = semesterId === "none" ? null : parseInt(semesterId)
    setSelectedSemesterId(id)
    setSelectedCourseOfferingId(null)
  }

  const handleCourseOfferingChange = (offeringId: string) => {
    const id = offeringId === "none" ? null : parseInt(offeringId)
    setSelectedCourseOfferingId(id)
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

    if (!selectedProgramId || !selectedBatchId || !selectedSemesterId || !selectedCourseOfferingId) {
      toast({
        title: "Validation Error",
        description: "Please select Program, Batch, Semester, and Course Offering before parsing",
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

    if (!selectedCourseOfferingId) {
      toast({
        title: "Validation Error",
        description: "Please select a course offering before submitting",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare payload exactly as backend expects
      const payload = {
        course_offering_id: selectedCourseOfferingId,
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

      console.log("📤 Submitting payload:", payload)

      const response = await apiFetch("/student-course-plo-results/upload-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Extract backend validation errors
        let errorMessage = errorData.message || "Failed to upload results"
        
        // Handle validation errors array
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(", ")
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (typeof errorData === "string") {
          errorMessage = errorData
        }
        
        // Handle HTTP status codes
        if (response.status === 400) {
          errorMessage = errorMessage || "Validation error. Please check your data."
        } else if (response.status === 401) {
          errorMessage = "Authentication failed. Please log in again."
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to upload results."
        } else if (response.status === 404) {
          errorMessage = "API endpoint not found. Please contact administrator."
        } else if (response.status >= 500) {
          errorMessage = errorMessage || "Server error. Please try again later."
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("✅ Upload successful:", result)

      const insertedCount = result.inserted_count || result.stats?.inserted || result.count || parsedData.length

      toast({
        title: "Success",
        description: `✅ Successfully uploaded results for ${insertedCount} students!`,
      })

      // Reset form and preview after successful upload
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
      console.error("❌ Upload error:", error)

      let errorMessage = "Failed to upload results. Please try again."
      if (error instanceof Error) {
        errorMessage = error.message
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
    return selectedProgramId && selectedBatchId && selectedSemesterId && selectedCourseOfferingId && selectedFile
  }

  const isParseReady = () => {
    return (
      isFormValid() &&
      !isParsing &&
      !isSubmitting &&
      !loadingPrograms &&
      !loadingBatches &&
      !loadingSemesters &&
      !loadingCourseOfferings
    )
  }

  const selectedCourseOffering = courseOfferings.find(
    (offering) => offering.id === selectedCourseOfferingId
  )

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
          <CardDescription>
            Select Program → Batch → Semester → Course Offering, then upload Excel file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Cascading Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Program Selection */}
              <div className="space-y-2">
                <Label htmlFor="program">Program *</Label>
                <Select
                  value={selectedProgramId?.toString() || "none"}
                  onValueChange={handleProgramChange}
                  disabled={loadingPrograms || isSubmitting}
                >
                  <SelectTrigger id="program">
                    <SelectValue placeholder={loadingPrograms ? "Loading..." : "Select program"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select program</SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id.toString()}>
                        {program.code} - {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Batch Selection */}
              <div className="space-y-2">
                <Label htmlFor="batch">Batch *</Label>
                <Select
                  value={selectedBatchId?.toString() || "none"}
                  onValueChange={handleBatchChange}
                  disabled={!selectedProgramId || loadingBatches || isSubmitting}
                >
                  <SelectTrigger id="batch">
                    <SelectValue
                      placeholder={
                        !selectedProgramId
                          ? "Select program first"
                          : loadingBatches
                          ? "Loading..."
                          : batches.length === 0
                          ? "No batches available"
                          : "Select batch"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select batch</SelectItem>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id.toString()}>
                        {batch.name} ({batch.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester Selection */}
              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select
                  value={selectedSemesterId?.toString() || "none"}
                  onValueChange={handleSemesterChange}
                  disabled={!selectedBatchId || loadingSemesters || isSubmitting}
                >
                  <SelectTrigger id="semester">
                    <SelectValue
                      placeholder={
                        !selectedBatchId
                          ? "Select batch first"
                          : loadingSemesters
                          ? "Loading semesters..."
                          : semesters.length === 0
                          ? "No active semesters"
                          : "Select semester"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingSemesters ? (
                      <div className="p-2 text-sm text-gray-500 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading semesters...
                      </div>
                    ) : semesters.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">
                        No active, unlocked semesters available
                      </div>
                    ) : (
                      <>
                        <SelectItem value="none">Select semester</SelectItem>
                        {semesters.map((semester) => (
                          <SelectItem key={semester.id} value={semester.id.toString()}>
                            Semester {semester.number}
                            {semester.start_date && semester.end_date && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({new Date(semester.start_date).getFullYear()})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {semesters.length === 0 && selectedBatchId && !loadingSemesters && (
                  <p className="text-xs text-amber-600">
                    No active, unlocked semesters found for this batch
                  </p>
                )}
                {semesters.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {semesters.length} active semester(s) available
                  </p>
                )}
              </div>

              {/* Course Offering Selection */}
              <div className="space-y-2">
                <Label htmlFor="courseOffering">Course Offering *</Label>
                <Select
                  value={selectedCourseOfferingId?.toString() || "none"}
                  onValueChange={handleCourseOfferingChange}
                  disabled={!selectedBatchId || !selectedSemesterId || loadingCourseOfferings || isSubmitting}
                >
                  <SelectTrigger id="courseOffering">
                    <SelectValue
                      placeholder={
                        !selectedBatchId || !selectedSemesterId
                          ? "Select batch and semester first"
                          : loadingCourseOfferings
                          ? "Loading..."
                          : courseOfferings.length === 0
                          ? "No offerings available"
                          : "Select course offering"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {loadingCourseOfferings ? (
                      <div className="p-2 text-sm text-gray-500">Loading course offerings...</div>
                    ) : courseOfferings.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">No course offerings available</div>
                    ) : (
                      <>
                        <SelectItem value="none">Select course offering</SelectItem>
                        {courseOfferings.map((offering) => (
                          <SelectItem key={offering.id} value={offering.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {offering.course?.course_code || "N/A"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {offering.course?.course_name || "N/A"}
                                {offering.instructor && ` • ${offering.instructor.name}`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected Course Offering Info */}
            {selectedCourseOffering && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Selected Course Offering:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Course:</span>
                    <p className="text-blue-900">
                      {selectedCourseOffering.course?.course_code} - {selectedCourseOffering.course?.course_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Semester:</span>
                    <p className="text-blue-900">Semester {selectedCourseOffering.semester?.number}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Batch:</span>
                    <p className="text-blue-900">{selectedCourseOffering.batch?.name}</p>
                  </div>
                  {selectedCourseOffering.instructor && (
                    <div>
                      <span className="text-blue-700 font-medium">Instructor:</span>
                      <p className="text-blue-900">{selectedCourseOffering.instructor.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

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

