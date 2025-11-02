'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

// Mock data for assessments
const mockAssessments = [
  { id: 1, type: 'Quiz', date: '2023-10-15', weight: 10, status: 'Pending' },
  { id: 2, type: 'Midterm', date: '2023-11-20', weight: 30, status: 'Completed' },
  { id: 3, type: 'Assignment', date: '2023-12-05', weight: 20, status: 'Pending' },
]

export default function ManageAssessments() {
  const router = useRouter();
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Assessments</CardTitle>
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
                <TableHead>Actions</TableHead>
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
                  <TableCell>
                    <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={() => router.push('/faculty/assessments/create')} className="mt-4">Add New Assessment</Button>
        </CardContent>
      </Card>
    </div>
  )
}