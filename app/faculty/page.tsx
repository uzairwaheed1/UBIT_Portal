"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ClipboardList, FileSpreadsheet, BarChart, TrendingUp, Users, Award } from "lucide-react"
import Link from "next/link"

export default function FacultyDashboard() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Total Assigned Courses",
      value: "5",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Assessments",
      value: "12",
      icon: ClipboardList,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Students Enrolled",
      value: "150",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Reports Generated",
      value: "8",
      icon: BarChart,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ]

  const quickActions = [
    {
      title: "View Courses",
      description: "Manage your assigned courses",
      icon: BookOpen,
      href: "/faculty/assigned-courses",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Plan Assessment",
      description: "Create and schedule assessments",
      icon: ClipboardList,
      href: "/faculty/assessments",
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      title: "Enter Marks",
      description: "Record student marks and grades",
      icon: FileSpreadsheet,
      href: "/faculty/marks-entry",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Generate Report",
      description: "Create and view reports",
      icon: BarChart,
      href: "/faculty/reports",
      color: "bg-green-600 hover:bg-green-700",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || "Faculty"}!</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your academic activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access frequently used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Button className={`w-full h-auto p-4 flex flex-col items-center gap-2 ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest academic activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent activity to display</p>
            <p className="text-sm text-gray-500 mt-2">Your recent activities will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

