"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function StudentMarks() {
  const { user } = useAuth()
  const [marks, setMarks] = useState([])
  const [selectedSemester, setSelectedSemester] = useState(user?.semester?.toString() || "1") // Updated default value to "1"
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.rollNo) {
      fetchMarks()
    }
  }, [user, selectedSemester])

  const fetchMarks = async () => {
    try {
      const query = selectedSemester ? `rollNo=${user?.rollNo}&semester=${selectedSemester}` : `rollNo=${user?.rollNo}`

      const response = await fetch(`/api/marks?${query}`)
      const data = await response.json()

      if (data.success) {
        setMarks(data.marks)
      }
    } catch (error) {
      console.error("Error fetching marks:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateGPA = (semesterMarks: any[]) => {
    if (semesterMarks.length === 0) return 0

    const totalPercentage = semesterMarks.reduce((sum, mark) => {
      return sum + (mark.obtainedMarks / mark.totalMarks) * 100
    }, 0)

    return Math.round((totalPercentage / semesterMarks.length / 25) * 100) / 100
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return "default"
    if (percentage >= 70) return "secondary"
    if (percentage >= 60) return "outline"
    return "destructive"
  }

  const semesterMarks = marks.filter((mark: any) =>
    selectedSemester ? mark.semester === Number(selectedSemester) : true,
  )

  const currentGPA = calculateGPA(semesterMarks)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Results</h1>
          <p className="text-gray-600 mt-2">View your marks and GPA</p>
        </div>

        <div className="w-48">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger>
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem> // Updated value to "all"
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <SelectItem key={sem} value={sem.toString()}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* GPA Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {selectedSemester === "all" ? "Overall GPA" : `Semester ${selectedSemester} GPA`} // Updated condition to
            check for "all"
          </CardTitle>
          <CardDescription>
            Based on {semesterMarks.length} course{semesterMarks.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-600">{currentGPA}</div>
          <p className="text-gray-600">Out of 4.0</p>
        </CardContent>
      </Card>

      {/* Marks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Marks</CardTitle>
          <CardDescription>
            {
              selectedSemester === "all" ? "All semester marks" : `Marks for Semester ${selectedSemester}` // Updated condition to check for "all"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading marks...</div>
          ) : semesterMarks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Theory</TableHead>
                  <TableHead>Lab</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semesterMarks.map((mark: any, index: number) => {
                  const percentage = Math.round((mark.obtainedMarks / mark.totalMarks) * 100)
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{mark.course}</TableCell>
                      <TableCell>{mark.examType}</TableCell>
                      <TableCell>{mark.semester}</TableCell>
                      <TableCell>{mark.theoryTotal > 0 ? `${mark.theoryObtained}/${mark.theoryTotal}` : "-"}</TableCell>
                      <TableCell>{mark.labTotal > 0 ? `${mark.labObtained}/${mark.labTotal}` : "-"}</TableCell>
                      <TableCell className="font-medium">
                        {mark.obtainedMarks}/{mark.totalMarks}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getGradeColor(percentage)}>{percentage}%</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No marks available for the selected semester</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
