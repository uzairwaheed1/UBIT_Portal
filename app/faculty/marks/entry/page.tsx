"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Save, Upload, Lock, Calculator } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Student {
  _id: string
  rollNo: string
  name: string
  email: string
}

interface Course {
  _id: string
  courseCode: string
  courseName: string
}

interface StudentMarks {
  [studentId: string]: {
    midterm: number
    assignment: number
    cep: number
    finalExam: number
    report: number
    rubric: number
    oe: number
    quiz: number
    practicalFinal: number
  }
}

interface Assessment {
  _id: string
  studentId: {
    _id: string
    rollNo: string
    name: string
  }
  midterm: number
  assignment: number
  cep: number
  finalExam: number
  report: number
  rubric: number
  oe: number
  quiz: number
  practicalFinal: number
  totalMarks: number
  cloAttainment: Array<{
    cloId: string
    cloName: string
    marksObtained: number
    totalMarks: number
    attainmentPercent: number
    linkedPLO: string
  }>
}

export default function ManualEntry() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]) // Multiple student selection
  const [courses, setCourses] = useState<Course[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([]) // All available students
  const [students, setStudents] = useState<Student[]>([]) // Filtered students to display
  const [studentMarks, setStudentMarks] = useState<StudentMarks>({})
  const [existingAssessments, setExistingAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showStudentSelector, setShowStudentSelector] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourseId) {
      // Reset student selection when course changes
      setSelectedStudentIds([])
      setShowStudentSelector(false)
      fetchStudents()
      fetchExistingAssessments()
    } else {
      setStudents([])
      setAllStudents([])
      setStudentMarks({})
      setExistingAssessments([])
      setSelectedStudentIds([])
      setShowStudentSelector(false)
    }
  }, [selectedCourseId])

  useEffect(() => {
    if (allStudents.length > 0 && selectedStudentIds.length > 0) {
      setStudents(allStudents.filter((s) => selectedStudentIds.includes(s._id)))
    } else if (allStudents.length > 0 && selectedStudentIds.length === 0) {
      setStudents(allStudents)
    }
  }, [selectedStudentIds, allStudents])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      const data = await response.json()
      if (data.success) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to fetch courses")
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students")
      const data = await response.json()
      if (data.success) {
        setAllStudents(data.students)
        // If no specific students selected, show all students
        if (selectedStudentIds.length === 0) {
          setStudents(data.students)
        } else {
          // Filter to show only selected students
          setStudents(data.students.filter((s: Student) => selectedStudentIds.includes(s._id)))
        }
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to fetch students")
    }
  }

  const handleStudentSelection = (studentIds: string[]) => {
    setSelectedStudentIds(studentIds)
    if (studentIds.length === 0) {
      setStudents(allStudents)
    } else {
      setStudents(allStudents.filter((s) => studentIds.includes(s._id)))
    }
  }

  const fetchExistingAssessments = async () => {
    if (!selectedCourseId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/assessments?courseId=${selectedCourseId}`)
      const data = await response.json()
      if (data.success) {
        setExistingAssessments(data.data)
        // Pre-populate marks from existing assessments
        const marks: StudentMarks = {}
        data.data.forEach((assessment: Assessment) => {
          marks[assessment.studentId._id] = {
            midterm: assessment.midterm || 0,
            assignment: assessment.assignment || 0,
            cep: assessment.cep || 0,
            finalExam: assessment.finalExam || 0,
            report: assessment.report || 0,
            rubric: assessment.rubric || 0,
            oe: assessment.oe || 0,
            quiz: assessment.quiz || 0,
            practicalFinal: assessment.practicalFinal || 0,
          }
        })
        setStudentMarks(marks)
      }
    } catch (error) {
      console.error("Error fetching assessments:", error)
      toast.error("Failed to fetch existing assessments")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkChange = (studentId: string, field: string, value: number) => {
    const maxValues: { [key: string]: number } = {
      midterm: 15,
      assignment: 10,
      cep: 15,
      finalExam: 60,
      report: 10,
      rubric: 10,
      oe: 10,
      quiz: 10,
      practicalFinal: 10,
    }

    const maxValue = maxValues[field] || 150
    const clampedValue = Math.max(0, Math.min(maxValue, value || 0))

    setStudentMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {
          midterm: 0,
          assignment: 0,
          cep: 0,
          finalExam: 0,
          report: 0,
          rubric: 0,
          oe: 0,
          quiz: 0,
          practicalFinal: 0,
        }),
        [field]: clampedValue,
      },
    }))
  }

  const calculateTotal = (studentId: string) => {
    const marks = studentMarks[studentId] || {}
    return (
      (marks.midterm || 0) +
      (marks.assignment || 0) +
      (marks.cep || 0) +
      (marks.finalExam || 0) +
      (marks.report || 0) +
      (marks.rubric || 0) +
      (marks.oe || 0) +
      (marks.quiz || 0) +
      (marks.practicalFinal || 0)
    )
  }

  const calculateCLOAttainment = (marks: {
    midterm: number
    assignment: number
    cep: number
    finalExam: number
    report: number
    rubric: number
    oe: number
    quiz: number
    practicalFinal: number
  }) => {
    const theoryMarks = (marks.midterm || 0) + (marks.assignment || 0) + (marks.cep || 0)
    const practicalMarks1 = (marks.report || 0) + (marks.rubric || 0) + (marks.oe || 0)
    const practicalMarks2 = (marks.quiz || 0) + (marks.practicalFinal || 0)

    return {
      CLO1: theoryMarks > 0 ? Math.min(100, Math.max(0, (theoryMarks / 40) * 100)) : 0,
      CLO2: marks.finalExam > 0 ? Math.min(100, Math.max(0, ((marks.finalExam || 0) / 60) * 100)) : 0,
      CLO3: practicalMarks1 > 0 ? Math.min(100, Math.max(0, (practicalMarks1 / 30) * 100)) : 0,
      CLO4: practicalMarks2 > 0 ? Math.min(100, Math.max(0, (practicalMarks2 / 20) * 100)) : 0,
    }
  }

  const saveAllMarks = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course")
      return
    }

    if (students.length === 0) {
      toast.error("No students found for this course")
      return
    }

    setSaving(true)
    let successCount = 0
    let errorCount = 0

    try {
      for (const student of students) {
        const marks = studentMarks[student._id]
        if (!marks) continue

        try {
          const response = await fetch("/api/assessments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: student._id,
              courseId: selectedCourseId,
              ...marks,
            }),
          })

          const data = await response.json()
          if (data.success) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          console.error(`Error saving marks for ${student.name}:`, error)
          errorCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully saved marks for ${successCount} student(s)`)
        fetchExistingAssessments()
      }

      if (errorCount > 0) {
        toast.error(`Failed to save marks for ${errorCount} student(s)`)
      }
    } catch (error) {
      console.error("Error saving marks:", error)
      toast.error("Error saving marks")
    } finally {
      setSaving(false)
    }
  }

  const saveSingleStudentMarks = async (studentId: string) => {
    if (!selectedCourseId) {
      toast.error("Please select a course")
      return
    }

    const marks = studentMarks[studentId]
    if (!marks) {
      toast.error("No marks entered for this student")
      return
    }

    setSaving(true)
    try {
      const student = students.find((s) => s._id === studentId)
      if (!student) {
        toast.error("Student not found")
        return
      }

      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student._id,
          courseId: selectedCourseId,
          ...marks,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Marks saved for ${student.name}`)
        fetchExistingAssessments()
      } else {
        toast.error(data.error || "Failed to save marks")
      }
    } catch (error) {
      console.error("Error saving marks:", error)
      toast.error("Error saving marks")
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (attainment: number) => {
    if (attainment >= 70) return "bg-green-500"
    if (attainment >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Auto-load sample data on mount if database is empty
  useEffect(() => {
    const autoLoadSampleData = async () => {
      try {
        // Check if we have any courses or students
        const [coursesRes, studentsRes] = await Promise.all([
          fetch("/api/courses"),
          fetch("/api/students"),
        ])

        const [coursesData, studentsData] = await Promise.all([
          coursesRes.json(),
          studentsRes.json(),
        ])

        // If no courses or students exist, automatically seed sample data
        if (
          (coursesData.success && coursesData.courses.length === 0) ||
          (studentsData.success && studentsData.students.length === 0)
        ) {
          await fetch("/api/seed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "all" }),
          })
          // Refresh the data
          await fetchCourses()
        }
      } catch (error) {
        console.error("Error auto-loading sample data:", error)
      }
    }

    autoLoadSampleData()
  }, [])

  const selectedCourse = courses.find((c) => c._id === selectedCourseId)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">Enter / Upload Marks</h1>
          <p className="text-muted-foreground">
            Input student marks for all assessment components (Total: 150 marks)
          </p>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course & Student Selection</CardTitle>
                <CardDescription>Select a course and students to enter marks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="course">Select Course</Label>
                        {selectedCourseId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCourseId("")
                              setSelectedStudentIds([])
                              setStudentMarks({})
                            }}
                            className="h-6 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course._id} value={course._id}>
                              {course.courseCode} - {course.courseName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="students">Select Students</Label>
                      <Select
                        value={selectedStudentIds.length > 0 ? "selected" : "all"}
                        onValueChange={(value) => {
                          if (value === "all") {
                            handleStudentSelection([])
                          } else if (value === "select") {
                            setShowStudentSelector(true)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select students" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Students ({allStudents.length})</SelectItem>
                          <SelectItem value="select">Select Specific Students</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {showStudentSelector && allStudents.length > 0 && (
                    <div className="p-4 border rounded-lg bg-muted/30 max-h-60 overflow-y-auto">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Select Students ({selectedStudentIds.length} selected)</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowStudentSelector(false)
                          }}
                        >
                          Close
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {allStudents.map((student) => (
                          <div key={student._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`student-${student._id}`}
                              checked={selectedStudentIds.includes(student._id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleStudentSelection([...selectedStudentIds, student._id])
                                } else {
                                  handleStudentSelection(selectedStudentIds.filter((id) => id !== student._id))
                                }
                              }}
                            />
                            <label
                              htmlFor={`student-${student._id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {student.rollNo} - {student.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleStudentSelection(allStudents.map((s) => s._id))
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleStudentSelection([])
                          }}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedCourse && (
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium">
                        Selected Course: <span className="font-bold">{selectedCourse.courseCode}</span> - {selectedCourse.courseName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {students.length} student(s) {selectedStudentIds.length > 0 ? "selected" : "available"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedCourseId && students.length > 0 && (
      <Card>
        <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Assessment Marks Entry</CardTitle>
                      <CardDescription>
                        Enter marks for all assessment components. CLO/PLO attainment is calculated automatically.
                      </CardDescription>
                    </div>
                    <Button onClick={saveAllMarks} disabled={saving} size="lg">
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving..." : "Save All Marks"}
                    </Button>
                  </div>
        </CardHeader>
        <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading assessments...</div>
                  ) : (
                    <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                            <TableHead className="sticky left-0 bg-background z-10">Student</TableHead>
                            <TableHead colSpan={3} className="text-center bg-indigo-50">
                              Theory (40 marks)
                            </TableHead>
                            <TableHead className="text-center bg-yellow-50">Final Exam (60)</TableHead>
                            <TableHead colSpan={5} className="text-center bg-green-50">
                              Practical (50 marks)
                            </TableHead>
                            <TableHead className="text-center">Total</TableHead>
                            <TableHead className="text-center">CLO Attainment</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                          <TableRow>
                            <TableHead className="sticky left-0 bg-background z-10"></TableHead>
                            <TableHead className="text-center bg-indigo-50">Mid (15)</TableHead>
                            <TableHead className="text-center bg-indigo-50">Assign (10)</TableHead>
                            <TableHead className="text-center bg-indigo-50">CEP (15)</TableHead>
                            <TableHead className="text-center bg-yellow-50">Final (60)</TableHead>
                            <TableHead className="text-center bg-green-50">Rep (10)</TableHead>
                            <TableHead className="text-center bg-green-50">Rub (10)</TableHead>
                            <TableHead className="text-center bg-green-50">OE (10)</TableHead>
                            <TableHead className="text-center bg-green-50">Quiz (10)</TableHead>
                            <TableHead className="text-center bg-green-50">Prac (10)</TableHead>
                            <TableHead className="text-center">/150</TableHead>
                            <TableHead className="text-center">%</TableHead>
                            <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                          {students.map((student) => {
                            const marks = studentMarks[student._id] || {
                              midterm: 0,
                              assignment: 0,
                              cep: 0,
                              finalExam: 0,
                              report: 0,
                              rubric: 0,
                              oe: 0,
                              quiz: 0,
                              practicalFinal: 0,
                            }
                            const total = calculateTotal(student._id)
                            const cloAttainment = calculateCLOAttainment(marks)
                            const avgAttainment =
                              (cloAttainment.CLO1 + cloAttainment.CLO2 + cloAttainment.CLO3 + cloAttainment.CLO4) / 4

                            return (
                              <TableRow key={student._id}>
                                <TableCell className="sticky left-0 bg-background z-10 font-medium">
                                  <div>
                                    <div>{student.name}</div>
                                    <div className="text-xs text-muted-foreground">{student.rollNo}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="bg-indigo-50">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="15"
                                    value={marks.midterm || ""}
                                    onChange={(e) =>
                                      handleMarkChange(student._id, "midterm", parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 text-center"
                                  />
                                </TableCell>
                                <TableCell className="bg-indigo-50">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={marks.assignment || ""}
                                    onChange={(e) =>
                                      handleMarkChange(student._id, "assignment", parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 text-center"
                                  />
                                </TableCell>
                                <TableCell className="bg-indigo-50">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="15"
                                    value={marks.cep || ""}
                                    onChange={(e) =>
                                      handleMarkChange(student._id, "cep", parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 text-center"
                                  />
                                </TableCell>
                                <TableCell className="bg-yellow-50">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={marks.finalExam || ""}
                                    onChange={(e) =>
                                      handleMarkChange(student._id, "finalExam", parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 text-center"
                                  />
                                </TableCell>
                                <TableCell className="bg-green-50">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={marks.report || ""}
                                    onChange={(e) =>
                                      handleMarkChange(student._id, "report", parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 text-center"
                                  />
                                </TableCell>
                                <TableCell className="bg-green-50">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={marks.rubric || ""}
                                    onChange={(e) =>
                                      handleMarkChange(student._id, "rubric", parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 text-center"
                                  />
                                </TableCell>
                                <TableCell className="bg-green-50">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={marks.oe || ""}
                                    onChange={(e) =>
                                      handleMarkChange(student._id, "oe", parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 text-center"
                                  />
                                </TableCell>
                                <TableCell className="bg-green-50">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={marks.quiz || ""}
                                    onChange={(e) =>
                                      handleMarkChange(student._id, "quiz", parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 text-center"
                                  />
                                </TableCell>
                                <TableCell className="bg-green-50">
                    <Input 
                      type="number" 
                                    min="0"
                                    max="10"
                                    value={marks.practicalFinal || ""}
                                    onChange={(e) =>
                                      handleMarkChange(
                                        student._id,
                                        "practicalFinal",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-16 text-center"
                    />
                  </TableCell>
                                <TableCell className="text-center font-semibold">{total}</TableCell>
                                <TableCell className="text-center">
                                  <Badge className={getStatusColor(avgAttainment)}>
                                    {avgAttainment.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => saveSingleStudentMarks(student._id)}
                                    disabled={saving}
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                </TableCell>
                </TableRow>
                            )
                          })}
            </TableBody>
          </Table>
                    </div>
                  )}

                  {students.length > 0 && (
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-semibold mb-2">CLO Attainment Summary (Average)</h3>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">CLO1 → PLO1:</span>{" "}
                          <span className="font-medium">
                            {(
                              students.reduce((sum, s) => {
                                const marks = studentMarks[s._id] || {}
                                return sum + calculateCLOAttainment(marks).CLO1
                              }, 0) / students.length
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CLO2 → PLO2:</span>{" "}
                          <span className="font-medium">
                            {(
                              students.reduce((sum, s) => {
                                const marks = studentMarks[s._id] || {}
                                return sum + calculateCLOAttainment(marks).CLO2
                              }, 0) / students.length
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CLO3 → PLO3:</span>{" "}
                          <span className="font-medium">
                            {(
                              students.reduce((sum, s) => {
                                const marks = studentMarks[s._id] || {}
                                return sum + calculateCLOAttainment(marks).CLO3
                              }, 0) / students.length
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CLO4 → PLO4:</span>{" "}
                          <span className="font-medium">
                            {(
                              students.reduce((sum, s) => {
                                const marks = studentMarks[s._id] || {}
                                return sum + calculateCLOAttainment(marks).CLO4
                              }, 0) / students.length
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Upload Marks</CardTitle>
                <CardDescription>Upload marks for multiple students via Excel/CSV file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Upload marks via Excel/CSV file
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      File should include columns: RollNo, Midterm, Assignment, CEP, FinalExam, Report,
                      Rubric, OE, Quiz, PracticalFinal
                    </p>
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </label>
                    <input id="file-upload" type="file" className="hidden" accept=".csv,.xlsx,.xls" />
                  </div>
                  <Button variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Process Upload
                  </Button>
                </div>
        </CardContent>
      </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
