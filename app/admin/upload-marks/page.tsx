"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function UploadMarks() {
  const [formData, setFormData] = useState({
    rollNo: "",
    course: "",
    examType: "",
    semester: "",
    theoryTotal: "",
    theoryObtained: "",
    labTotal: "",
    labObtained: "",
  })
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      const data = await response.json()
      if (data.success) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          semester: Number.parseInt(formData.semester),
          theoryTotal: Number.parseInt(formData.theoryTotal) || 0,
          theoryObtained: Number.parseInt(formData.theoryObtained) || 0,
          labTotal: Number.parseInt(formData.labTotal) || 0,
          labObtained: Number.parseInt(formData.labObtained) || 0,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: "Success", description: "Marks uploaded successfully" })
        setFormData({
          rollNo: "",
          course: "",
          examType: "",
          semester: "",
          theoryTotal: "",
          theoryObtained: "",
          labTotal: "",
          labObtained: "",
        })
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Student Marks</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Student Marks Entry</CardTitle>
          <CardDescription>Upload marks for theory and lab components</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rollNo">Student Roll Number</Label>
                <Input
                  id="rollNo"
                  type="text"
                  placeholder="e.g., CS-2021-001"
                  value={formData.rollNo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rollNo: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, course: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course: any) => (
                      <SelectItem key={course._id} value={course.courseName}>
                        {course.courseName} ({course.courseCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examType">Exam Type</Label>
                <Select
                  value={formData.examType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, examType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mid">Mid Term</SelectItem>
                    <SelectItem value="Final">Final Term</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Theory Marks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theoryTotal">Total Marks</Label>
                  <Input
                    id="theoryTotal"
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.theoryTotal}
                    onChange={(e) => setFormData((prev) => ({ ...prev, theoryTotal: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theoryObtained">Obtained Marks</Label>
                  <Input
                    id="theoryObtained"
                    type="number"
                    placeholder="e.g., 85"
                    value={formData.theoryObtained}
                    onChange={(e) => setFormData((prev) => ({ ...prev, theoryObtained: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Lab Marks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labTotal">Total Marks</Label>
                  <Input
                    id="labTotal"
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.labTotal}
                    onChange={(e) => setFormData((prev) => ({ ...prev, labTotal: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labObtained">Obtained Marks</Label>
                  <Input
                    id="labObtained"
                    type="number"
                    placeholder="e.g., 45"
                    value={formData.labObtained}
                    onChange={(e) => setFormData((prev) => ({ ...prev, labObtained: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Uploading Marks..." : "Upload Marks"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
