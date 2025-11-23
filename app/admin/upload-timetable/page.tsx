"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api-client"

export default function UploadTimetable() {
  const [formData, setFormData] = useState({
    semester: "",
    year: "",
    courseCode: "",
    courseName: "",
    date: "",
    day: "",
    time: "",
    classType: "",
    instructor: "",
    room: "",
  })
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await apiFetch("/api/courses")
      const data = await response.json()
      if (data.success) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast({ title: "Error", description: "Failed to fetch courses", variant: "destructive" })
    }
  }

  const handleCourseSelect = (courseId: string) => {
    const selectedCourse = courses.find((course: any) => course._id === courseId)
    if (selectedCourse) {
      setFormData((prev) => ({
        ...prev,
        courseCode: selectedCourse.code,
        courseName: selectedCourse.name,
        instructor: selectedCourse.instructor || "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiFetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semester: Number.parseInt(formData.semester),
          year: Number.parseInt(formData.year),
          course: `${formData.courseCode} - ${formData.courseName}`,
          date: formData.date,
          day: formData.day,
          time: formData.time,
          classType: formData.classType,
          instructor: formData.instructor,
          room: formData.room,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: "Success", description: "Timetable entry added successfully" })
        setFormData({
          semester: "",
          year: "",
          courseCode: "",
          courseName: "",
          date: "",
          day: "",
          time: "",
          classType: "",
          instructor: "",
          room: "",
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Timetable</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Class Schedule Entry</CardTitle>
          <CardDescription>Add class timings and schedule information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2024"
                  value={formData.year}
                  onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <Select
                  value={formData.day}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, day: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select
                value={formData.courseCode ? `${formData.courseCode} - ${formData.courseName}` : ""}
                onValueChange={handleCourseSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="text"
                  placeholder="09:00 - 10:30"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classType">Class Type</Label>
                <Select
                  value={formData.classType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, classType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lecture">Lecture</SelectItem>
                    <SelectItem value="Lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  type="text"
                  placeholder="e.g., Dr. Smith"
                  value={formData.instructor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, instructor: e.target.value }))}
                  required
                />
                {formData.courseCode && <p className="text-sm text-gray-500">Auto-filled from course information</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  type="text"
                  placeholder="e.g., Room 101"
                  value={formData.room}
                  onChange={(e) => setFormData((prev) => ({ ...prev, room: e.target.value }))}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Adding to Timetable..." : "Add to Timetable"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
