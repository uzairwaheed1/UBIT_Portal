'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for marks
const mockMarks = [
  { studentId: 'S001', name: 'John Doe', course: 'CS101', marks: 85, grade: 'A' },
  { studentId: 'S002', name: 'Jane Smith', course: 'CS101', marks: 78, grade: 'B' },
  { studentId: 'S003', name: 'Alice Johnson', course: 'CS101', marks: 92, grade: 'A+' },
]

export default function ViewMarks() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>View Marks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockMarks.map((mark) => (
                <TableRow key={mark.studentId}>
                  <TableCell>{mark.studentId}</TableCell>
                  <TableCell>{mark.name}</TableCell>
                  <TableCell>{mark.course}</TableCell>
                  <TableCell>{mark.marks}</TableCell>
                  <TableCell>{mark.grade}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}