'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for student comparison
const mockStudents = [
  { name: 'John Doe', gpa: 3.8, attendance: 95, assignments: 85 },
  { name: 'Jane Smith', gpa: 3.6, attendance: 92, assignments: 88 },
  { name: 'Alice Johnson', gpa: 4.0, attendance: 98, assignments: 92 },
]

export default function StudentComparison() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Student Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead>Attendance (%)</TableHead>
                <TableHead>Assignments Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((student, index) => (
                <TableRow key={index}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.gpa}</TableCell>
                  <TableCell>{student.attendance}</TableCell>
                  <TableCell>{student.assignments}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4 text-sm text-muted-foreground">Mock data comparing student performance metrics.</p>
        </CardContent>
      </Card>
    </div>
  )
}