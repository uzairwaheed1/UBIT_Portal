"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { BarChart3, Download, FileText } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"

interface Course {
  _id: string
  courseCode: string
  courseName: string
}

interface AttainmentData {
  cloId: string
  cloName: string
  attainment: number
  ploId: string
  ploName: string
  ploAttainment: number
}

export default function CLOPLOAttainment() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [attainmentData, setAttainmentData] = useState<AttainmentData[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchAttainmentData()
    } else {
      setAttainmentData([])
    }
  }, [selectedCourse])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      const data = await response.json()
      if (data.success) {
        setCourses(data.courses || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAttainmentData = async () => {
    try {
      // Fetch assessments for the selected course
      const assessmentResponse = await fetch(`/api/assessments?courseId=${selectedCourse}`)
      const assessmentData = await assessmentResponse.json()

      if (assessmentData.success && assessmentData.data) {
        // Calculate CLO and PLO attainments from assessments
        const attainments: AttainmentData[] = []
        
        // Group by CLO and calculate average attainment
        const cloMap = new Map<string, { total: number; count: number; ploId: string; ploName: string }>()
        
        assessmentData.data.forEach((assessment: any) => {
          if (assessment.cloAttainment && Array.isArray(assessment.cloAttainment)) {
            assessment.cloAttainment.forEach((clo: any) => {
              const key = clo.cloId
              if (!cloMap.has(key)) {
                cloMap.set(key, {
                  total: 0,
                  count: 0,
                  ploId: clo.linkedPLO || "",
                  ploName: clo.linkedPLO || "",
                })
              }
              const entry = cloMap.get(key)!
              entry.total += clo.attainmentPercent || 0
              entry.count += 1
            })
          }
        })

        // Convert to array format
        cloMap.forEach((value, key) => {
          attainments.push({
            cloId: key,
            cloName: key,
            attainment: value.count > 0 ? value.total / value.count : 0,
            ploId: value.ploId,
            ploName: value.ploName,
            ploAttainment: value.count > 0 ? value.total / value.count : 0,
          })
        })

        setAttainmentData(attainments)
      } else {
        setAttainmentData([])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attainment data",
        variant: "destructive",
      })
    }
  }

  const exportToPDF = () => {
    toast({
      title: "Export Started",
      description: "Generating PDF report...",
    })
    // In a real implementation, this would generate and download a PDF
  }

  const exportToCSV = () => {
    const headers = ["CLO ID", "CLO Name", "CLO Attainment (%)", "PLO ID", "PLO Name", "PLO Attainment (%)"]
    const rows = attainmentData.map((d) => [
      d.cloId,
      d.cloName,
      d.attainment.toFixed(2),
      d.ploId,
      d.ploName,
      d.ploAttainment.toFixed(2),
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `clo-plo-attainment-${selectedCourse}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Report exported successfully",
    })
  }

  const chartData = attainmentData.map((d) => ({
    name: d.cloId,
    cloAttainment: d.attainment,
    ploAttainment: d.ploAttainment,
  }))

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/faculty">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/faculty/reports">Reports</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>CLO/PLO Attainment Report</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generate Reports - CLO/PLO Attainment</h1>
          <p className="text-gray-600 mt-1">
            Generate comprehensive reports for Course Learning Outcomes and Program Learning Outcomes attainment
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Course</CardTitle>
              <CardDescription>
                Choose a course to generate CLO/PLO attainment report
              </CardDescription>
            </div>
            <div className="w-64">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Course" />
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
          </div>
        </CardHeader>
      </Card>

      {selectedCourse && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>CLO/PLO Attainment Overview</CardTitle>
              <CardDescription>
                Visual representation of CLO and PLO attainment percentages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attainmentData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No attainment data available for this course. Please ensure assessments have been entered.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cloAttainment" fill="#8884d8" name="CLO Attainment (%)" />
                    <Bar dataKey="ploAttainment" fill="#82ca9d" name="PLO Attainment (%)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CLO/PLO Attainment Trend</CardTitle>
              <CardDescription>
                Line chart showing attainment trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attainmentData.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cloAttainment"
                      stroke="#8884d8"
                      name="CLO Attainment (%)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="ploAttainment"
                      stroke="#82ca9d"
                      name="PLO Attainment (%)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Attainment Data</CardTitle>
              <CardDescription>
                Complete breakdown of CLO and PLO attainment percentages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left">CLO ID</th>
                      <th className="p-3 text-left">CLO Name</th>
                      <th className="p-3 text-left">CLO Attainment (%)</th>
                      <th className="p-3 text-left">PLO ID</th>
                      <th className="p-3 text-left">PLO Name</th>
                      <th className="p-3 text-left">PLO Attainment (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attainmentData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      attainmentData.map((data, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3 font-medium">{data.cloId}</td>
                          <td className="p-3">{data.cloName}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                data.attainment >= 80
                                  ? "bg-green-100 text-green-800"
                                  : data.attainment >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {data.attainment.toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-3 font-medium">{data.ploId}</td>
                          <td className="p-3">{data.ploName}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                data.ploAttainment >= 80
                                  ? "bg-green-100 text-green-800"
                                  : data.ploAttainment >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {data.ploAttainment.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedCourse && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Please select a course to generate the report</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

