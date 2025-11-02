"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, BookOpen, Calendar, ClipboardCheck, AlertCircle, BarChart3, FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Stats {
  totalStudents: number
  totalCourses: number
  pendingEvaluations: number
  completedAssessments: number
}

interface Activity {
  id: string
  action: string
  timestamp: string
}

export default function FacultyDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalCourses: 0,
    pendingEvaluations: 0,
    completedAssessments: 0,
  })
  
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Mock stats for preview since no DB
    setStats({
      totalStudents: 45,
      totalCourses: 3,
      pendingEvaluations: 4,
      completedAssessments: 8,
    })
    
    // Mock recent activities
    setActivities([
      { id: "1", action: "Uploaded marks for CS301 Quiz 2", timestamp: "Today, 10:30 AM" },
      { id: "2", action: "Created new assessment for SE201", timestamp: "Yesterday, 3:15 PM" },
      { id: "3", action: "Locked evaluation for CS101 Midterm", timestamp: "Yesterday, 11:20 AM" },
      { id: "4", action: "Generated CLO attainment report", timestamp: "2 days ago, 4:45 PM" },
      { id: "5", action: "Updated assessment roadmap for SE201", timestamp: "3 days ago, 9:10 AM" },
    ])
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Faculty Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Current semester</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Evaluations</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingEvaluations}</div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Assessments</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssessments}</div>
            <p className="text-xs text-muted-foreground mt-1">This semester</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Count</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used faculty tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/faculty/assessments/create">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Assessment
                </Button>
              </Link>
              <Link href="/faculty/marks/entry">
                <Button variant="outline" className="w-full justify-start">
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload Marks
                </Button>
              </Link>
              <Link href="/faculty/courses">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Courses
                </Button>
              </Link>
              <Link href="/faculty/reports/clo-attainment">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your last 5 actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-2"></div>
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}