"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { BookOpen, TrendingUp, GraduationCap, Target, ArrowRight } from "lucide-react"
import { obeService } from "@/lib/services/obe-service"
import type { StudentDashboardData, RecentCourse } from "@/lib/types/obe"
import { PLOChart } from "@/components/obe/plo-chart"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function OBEDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const data = await obeService.getDashboardData(user?.id?.toString() || "")
      setDashboardData(data)
    } catch (error) {
      console.error("Error fetching OBE dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePLOClick = (ploNumber: string) => {
    router.push(`/student/obe/plo/${ploNumber}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading OBE dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">Unable to load dashboard data</p>
      </div>
    )
  }

  const { student, program_plos, recent_courses, total_courses } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">OBE Dashboard</h1>
        <p className="text-gray-600 mt-2">Outcome-Based Education Performance Overview</p>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
                <p className="text-gray-600">Roll No: {student.roll_no}</p>
                <p className="text-sm text-gray-500">
                  {student.batch} • Semester {student.semester}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{student.cgpa.toFixed(2)}</div>
                <p className="text-sm text-gray-600">Overall CGPA</p>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{total_courses || 0}</div>
                <p className="text-sm text-gray-600">Total Courses</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_courses || 0}</div>
            <p className="text-xs text-muted-foreground">Across all semesters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.semester}</div>
            <p className="text-xs text-muted-foreground">{student.batch}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall CGPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.cgpa.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Cumulative Grade Point Average</p>
          </CardContent>
        </Card>
      </div>

      {/* PLO Performance Chart */}
      <PLOChart programPLOs={program_plos} />

      {/* Recent Course Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Course Results</CardTitle>
              <CardDescription>
                PLO attainment scores for your recent courses
              </CardDescription>
            </div>
            <button
              onClick={() => router.push("/student/obe/courses")}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All Courses
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead className="text-center">PLOs</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent_courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No recent course results available
                    </TableCell>
                  </TableRow>
                ) : (
                  recent_courses.map((course: RecentCourse, index: number) => {
                    const ploCount = Object.keys(course).filter(
                      (key) => key.startsWith("plo") && course[key as keyof RecentCourse] !== undefined
                    ).length

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{course.course_code}</TableCell>
                        <TableCell>{course.course_title}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {Object.entries(course)
                              .filter(([key]) => key.startsWith("plo"))
                              .map(([plo, score]) => {
                                if (score === undefined) return null
                                const ploNum = plo.toUpperCase()
                                const color =
                                  score >= 70 ? "bg-green-100 text-green-700" : score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                return (
                                  <Badge
                                    key={plo}
                                    variant="outline"
                                    className={`${color} cursor-pointer hover:opacity-80`}
                                    onClick={() => handlePLOClick(plo)}
                                    title={`Click to view ${ploNum} details`}
                                  >
                                    {ploNum}: {Math.round(score)}%
                                  </Badge>
                                )
                              })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => router.push("/student/obe/courses")}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            View Details
                          </button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/student/obe/courses")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course-wise PLO View
            </CardTitle>
            <CardDescription>
              View detailed PLO performance for all your courses
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/student/obe/plo/plo1")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              PLO Details
            </CardTitle>
            <CardDescription>
              Explore individual Program Learning Outcome breakdowns
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
