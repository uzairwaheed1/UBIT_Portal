"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { BookOpen, FileText, TrendingUp, GraduationCap, Users } from "lucide-react"

interface DashboardData {
  currentGPA: number
  cgpa: number
  previousSemesterMarks: any[]
  upcomingEvents: any[]
  pendingAssignments: any[]
  currentSemesterCourses: any[]
  totalCourses: number
  previousSemester: number
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    currentGPA: 0,
    cgpa: 0,
    previousSemesterMarks: [],
    upcomingEvents: [],
    pendingAssignments: [],
    currentSemesterCourses: [],
    totalCourses: 0,
    previousSemester: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.rollNo) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const [marksRes, eventsRes, assignmentsRes, coursesRes] = await Promise.all([
        fetch(`/api/marks?rollNo=${user?.rollNo}`),
        fetch("/api/events"),
        fetch(`/api/assignments?semester=${user?.semester}`),
        fetch("/api/courses"),
      ])

      const [marksData, eventsData, assignmentsData, coursesData] = await Promise.all([
        marksRes.json(),
        eventsRes.json(),
        assignmentsRes.json(),
        coursesRes.json(),
      ])

      // Find previous semester results with fallback
      let previousSemesterMarks: any[] = []
      let previousSemester = 0
      let currentGPA = 0
      let cgpa = 0

      if (marksData.success && marksData.marks.length > 0) {
        // Try to find previous semester results (fallback logic)
        for (let sem = (user?.semester || 1) - 1; sem >= 1; sem--) {
          const semesterMarks = marksData.marks.filter((mark: any) => mark.semester === sem)
          if (semesterMarks.length > 0) {
            previousSemesterMarks = semesterMarks
            previousSemester = sem
            break
          }
        }

        // Calculate GPA for previous semester
        if (previousSemesterMarks.length > 0) {
          const totalPercentage = previousSemesterMarks.reduce((sum: number, mark: any) => {
            return sum + (mark.obtainedMarks / mark.totalMarks) * 100
          }, 0)
          currentGPA = Math.round((totalPercentage / previousSemesterMarks.length / 25) * 100) / 100
        }

        // Overall CGPA calculation
        const totalPercentage = marksData.marks.reduce((sum: number, mark: any) => {
          return sum + (mark.obtainedMarks / mark.totalMarks) * 100
        }, 0)
        cgpa = Math.round((totalPercentage / marksData.marks.length / 25) * 100) / 100
      }

      // Get current semester courses
      let currentSemesterCourses: any[] = []
      if (coursesData.success) {
        currentSemesterCourses = coursesData.courses.filter((course: any) => course.semester === user?.semester)
      }

      setDashboardData({
        currentGPA,
        cgpa,
        previousSemesterMarks,
        upcomingEvents: eventsData.success ? eventsData.events.slice(0, 3) : [],
        pendingAssignments: assignmentsData.success ? assignmentsData.assignments.slice(0, 3) : [],
        currentSemesterCourses,
        totalCourses: currentSemesterCourses.length,
        previousSemester,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-96">Loading dashboard...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's your academic overview</p>
      </div>

      {/* Student Info Card */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                <p className="text-gray-600">Roll No: {user?.rollNo}</p>
                <p className="text-sm text-gray-500">
                  {user?.domain} Program • Semester {user?.semester}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{dashboardData.cgpa}</div>
              <p className="text-sm text-gray-600">Overall CGPA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previous Semester GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.currentGPA}</div>
            <p className="text-xs text-muted-foreground">Semester {dashboardData.previousSemester} Results</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.semester}</div>
            <p className="text-xs text-muted-foreground">{user?.domain} Program</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalCourses}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Due soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Semester Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Semester Courses</CardTitle>
            <CardDescription>Your courses for Semester {user?.semester}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.currentSemesterCourses.length > 0 ? (
                dashboardData.currentSemesterCourses.map((course: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{course.courseName}</h4>
                      <p className="text-sm text-gray-600">
                        {course.courseCode} • {course.credits} Credits
                      </p>
                      <p className="text-xs text-gray-500">Instructor: {course.instructor}</p>
                    </div>
                    <Badge variant="outline">{course.credits} CR</Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No courses available for this semester</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Previous Semester Results</CardTitle>
            <CardDescription>Semester {dashboardData.previousSemester} exam results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.previousSemesterMarks.length > 0 ? (
                dashboardData.previousSemesterMarks.map((mark: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{mark.course}</p>
                      <p className="text-sm text-gray-600">{mark.examType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {mark.obtainedMarks}/{mark.totalMarks}
                      </p>
                      <Badge variant={mark.obtainedMarks / mark.totalMarks >= 0.8 ? "default" : "secondary"}>
                        {Math.round((mark.obtainedMarks / mark.totalMarks) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No previous semester results available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Don't miss these important events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.upcomingEvents.length > 0 ? (
              dashboardData.upcomingEvents.map((event: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-1">
                    <p className="font-medium">{event.eventName}</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                    <p className="text-xs text-gray-500">{new Date(event.time).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline">{event.type}</Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No upcoming events</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
