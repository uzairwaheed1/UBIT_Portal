"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import type { CoursePLO, CoursePLOData } from "@/lib/types/obe"
import { Filter } from "lucide-react"

interface CoursePLOTableProps {
  data: CoursePLOData
  onPLOClick?: (ploNumber: string) => void
}

export function CoursePLOTable({ data, onPLOClick }: CoursePLOTableProps) {
  const [selectedSemester, setSelectedSemester] = useState<string>("all")

  // Filter courses by semester
  const filteredCourses =
    selectedSemester === "all"
      ? data.courses
      : data.courses.filter((course) => course.semester === Number.parseInt(selectedSemester))

  // Get PLO columns (PLO1 to PLO12)
  const ploColumns = Array.from({ length: 12 }, (_, i) => `plo${i + 1}`)

  // Color coding function
  const getPLOCellStyle = (score: number | undefined) => {
    if (score === undefined) return { bg: "bg-gray-50", text: "text-gray-400" }
    if (score >= 70) return { bg: "bg-green-50", text: "text-green-700" }
    if (score >= 50) return { bg: "bg-yellow-50", text: "text-yellow-700" }
    return { bg: "bg-red-50", text: "text-red-700" }
  }

  const getPLOCellContent = (score: number | undefined) => {
    if (score === undefined) return "N/A"
    return `${Math.round(score)}%`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Course-wise PLO Performance</CardTitle>
            <CardDescription>
              View PLO attainment for each course across all semesters
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {data.semesters.map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px] sticky left-0 bg-white z-10">
                    Course Code
                  </TableHead>
                  <TableHead className="min-w-[250px] sticky left-[120px] bg-white z-10">
                    Course Name
                  </TableHead>
                  {ploColumns.map((plo) => (
                    <TableHead
                      key={plo}
                      className="text-center min-w-[80px] cursor-pointer hover:bg-gray-50"
                      onClick={() => onPLOClick?.(plo)}
                      title={`Click to view ${plo.toUpperCase()} details`}
                    >
                      {plo.toUpperCase()}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center text-muted-foreground py-8">
                      No courses found for the selected semester
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course, index) => (
                    <TableRow key={`${course.course_code}-${index}`}>
                      <TableCell className="font-medium sticky left-0 bg-white z-10">
                        {course.course_code}
                      </TableCell>
                      <TableCell className="sticky left-[120px] bg-white z-10">
                        {course.course_title}
                      </TableCell>
                      {ploColumns.map((plo) => {
                        const score = course[plo as keyof CoursePLO] as number | undefined
                        const style = getPLOCellStyle(score)
                        return (
                          <TableCell
                            key={plo}
                            className={`text-center ${style.bg} ${style.text} cursor-pointer hover:opacity-80 transition-opacity`}
                            onClick={() => score !== undefined && onPLOClick?.(plo)}
                            title={
                              score !== undefined
                                ? `Click to view ${plo.toUpperCase()} details`
                                : "No data available"
                            }
                          >
                            {getPLOCellContent(score)}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-50 border border-green-200"></div>
            <span className="text-green-700">≥70%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-yellow-50 border border-yellow-200"></div>
            <span className="text-yellow-700">50-70%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-50 border border-red-200"></div>
            <span className="text-red-700">&lt;50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gray-50 border border-gray-200"></div>
            <span className="text-gray-400">N/A</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
