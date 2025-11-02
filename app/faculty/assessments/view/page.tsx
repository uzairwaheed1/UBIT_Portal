'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for assessments
const mockAssessments = [
  { id: 1, type: 'Quiz', date: '2023-10-15', weight: 10, status: 'Completed', score: '85%' },
  { id: 2, type: 'Midterm', date: '2023-11-20', weight: 30, status: 'Completed', score: '78%' },
  { id: 3, type: 'Assignment', date: '2023-12-05', weight: 20, status: 'Pending', score: '-' },
]

export default function ViewAssessments() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>View Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Weight (%)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAssessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>{assessment.id}</TableCell>
                  <TableCell>{assessment.type}</TableCell>
                  <TableCell>{assessment.date}</TableCell>
                  <TableCell>{assessment.weight}</TableCell>
                  <TableCell>{assessment.status}</TableCell>
                  <TableCell>{assessment.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}