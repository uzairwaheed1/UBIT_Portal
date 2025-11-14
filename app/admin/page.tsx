"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  FileText, 
  BookOpen, 
  Calendar, 
  UserCheck, 
  Target, 
  Settings, 
  BarChart3,
  GraduationCap,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface Stats {
  totalStudents: number
  totalCourses: number
  totalFaculty: number
  totalBatches: number
  activeSemesters: number
  totalCLOs: number
  totalPLOs: number
  totalPEOs: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalCourses: 0,
    totalFaculty: 0,
    totalBatches: 0,
    activeSemesters: 0,
    totalCLOs: 0,
    totalPLOs: 0,
    totalPEOs: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const modules = [
    {
      title: "Manage Faculty",
      description: "CRUD operations for faculty management and course assignment",
      href: "/admin/manage-faculty",
      icon: UserCheck,
      number: "C1",
      color: "bg-blue-500"
    },
    {
      title: "Batch & Semester Management",
      description: "Manage batches and semester lifecycle",
      href: "/admin/batch-semester",
      icon: Calendar,
      number: "C2",
      color: "bg-green-500"
    },
    {
      title: "Student Management",
      description: "CRUD operations and bulk import for students",
      href: "/admin/student-management",
      icon: Users,
      number: "C3",
      color: "bg-purple-500"
    },
    {
      title: "Course Management",
      description: "Manage courses and assign teachers",
      href: "/admin/course-management",
      icon: BookOpen,
      number: "C4",
      color: "bg-orange-500"
    },
    {
      title: "CLO/PLO/PEO Management",
      description: "Define and map learning outcomes",
      href: "/admin/outcome-management",
      icon: Target,
      number: "C5",
      color: "bg-red-500"
    },
    {
      title: "OBE Configuration",
      description: "Configure grading scales and thresholds",
      href: "/admin/obe-config",
      icon: Settings,
      number: "C6",
      color: "bg-indigo-500"
    },
    {
      title: "Reports & Analytics",
      description: "Generate reports and view analytics",
      href: "/admin/reports",
      icon: BarChart3,
      number: "C7",
      color: "bg-teal-500"
    },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Overview</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to the University Management System</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalFaculty}</div>
            <p className="text-xs text-muted-foreground mt-1">Active faculty members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Available courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Semesters</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.activeSemesters}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Modules Grid */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Admin Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link key={module.href} href={module.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${module.color} text-white rounded-lg p-3`}>
                      <module.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {module.number}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="mt-2">{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-blue-600 font-medium">
                    Access Module <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
