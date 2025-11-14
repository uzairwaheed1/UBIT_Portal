"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ClipboardList, Search, Download } from "lucide-react"

interface CLOPLOMapping {
  _id: string
  cloId: {
    _id: string
    cloId: string
    cloName: string
    description: string
  }
  ploId: {
    _id: string
    ploId: string
    ploName: string
    description: string
  }
  courseId: {
    _id: string
    courseCode: string
    courseName: string
  }
  strength: string
}

interface Course {
  _id: string
  courseCode: string
  courseName: string
}

export default function AutoMappedPLO() {
  const [mappings, setMappings] = useState<CLOPLOMapping[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse && selectedCourse !== "all") {
      fetchMappings()
    } else if (selectedCourse === "all") {
      fetchMappings()
    } else {
      setMappings([])
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

  const fetchMappings = async () => {
    try {
      const response = await fetch("/api/outcome-mapping?type=clo-plo")
      const data = await response.json()
      if (data.success) {
        let filteredMappings = data.mappings || []
        
        // Filter by selected course if a course is selected
        if (selectedCourse && selectedCourse !== "all") {
          filteredMappings = filteredMappings.filter(
            (m: CLOPLOMapping) => m.courseId?._id === selectedCourse
          )
        }

        // Filter by search term
        if (searchTerm) {
          filteredMappings = filteredMappings.filter(
            (m: CLOPLOMapping) =>
              m.cloId?.cloId.toLowerCase().includes(searchTerm.toLowerCase()) ||
              m.cloId?.cloName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              m.ploId?.ploId.toLowerCase().includes(searchTerm.toLowerCase()) ||
              m.ploId?.ploName.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }

        setMappings(filteredMappings)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch mappings",
        variant: "destructive",
      })
    }
  }

  const exportToCSV = () => {
    const headers = ["CLO ID", "CLO Name", "PLO ID", "PLO Name", "Course", "Strength"]
    const rows = mappings.map((m) => [
      m.cloId?.cloId || "",
      m.cloId?.cloName || "",
      m.ploId?.ploId || "",
      m.ploId?.ploName || "",
      `${m.courseId?.courseCode || ""} - ${m.courseId?.courseName || ""}`,
      m.strength,
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "auto-mapped-plo.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Report exported successfully",
    })
  }

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
          <BreadcrumbPage>Auto-mapped to PLO</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auto-mapped to PLO</h1>
          <p className="text-gray-600 mt-1">
            View CLO to PLO mappings for your courses
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>CLO-PLO Mappings</CardTitle>
              <CardDescription>
                View automatically mapped Course Learning Outcomes to Program Learning Outcomes
              </CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="w-64">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.courseCode} - {course.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search mappings..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    fetchMappings()
                  }}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : mappings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No CLO-PLO mappings found. {selectedCourse && selectedCourse !== "all" && "Try selecting a different course."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CLO ID</TableHead>
                    <TableHead>CLO Name</TableHead>
                    <TableHead>PLO ID</TableHead>
                    <TableHead>PLO Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Mapping Strength</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping._id}>
                      <TableCell className="font-medium">
                        {mapping.cloId?.cloId || "N/A"}
                      </TableCell>
                      <TableCell>{mapping.cloId?.cloName || "N/A"}</TableCell>
                      <TableCell className="font-medium">
                        {mapping.ploId?.ploId || "N/A"}
                      </TableCell>
                      <TableCell>{mapping.ploId?.ploName || "N/A"}</TableCell>
                      <TableCell>
                        {mapping.courseId?.courseCode || "N/A"} - {mapping.courseId?.courseName || "N/A"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            mapping.strength === "Strong"
                              ? "bg-green-100 text-green-800"
                              : mapping.strength === "Moderate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {mapping.strength}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

