"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const mockCourses = [
  { id: 1, code: "CS101", name: "Introduction to Computer Science", students: 45, semester: "Fall 2023" },
  { id: 2, code: "SE201", name: "Software Engineering Fundamentals", students: 38, semester: "Fall 2023" },
  { id: 3, code: "DS301", name: "Data Structures and Algorithms", students: 42, semester: "Fall 2023" },
]

export default function MyCourses() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Courses</h1>
      <Card>
        <CardHeader>
          <CardTitle>Assigned Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.students}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}