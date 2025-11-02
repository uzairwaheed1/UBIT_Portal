'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"

// Mock students for manual entry
const mockStudents = [
  { id: "S001", name: "John Doe" },
  { id: "S002", name: "Jane Smith" },
]

export default function ManualEntry() {
  const [marks, setMarks] = useState({})

  const handleMarkChange = (id, value) => {
    setMarks(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = () => {
    console.log("Submitted marks:", marks)
    // TODO: Implement actual submission
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Manual Marks Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map(student => (
                <TableRow key={student.id}>
                  <TableCell>{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      value={marks[student.id] || ""} 
                      onChange={e => handleMarkChange(student.id, e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={handleSubmit} className="mt-4">Submit Marks</Button>
        </CardContent>
      </Card>
    </div>
  )
}