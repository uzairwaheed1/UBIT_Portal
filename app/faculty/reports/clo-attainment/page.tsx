'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for CLO Attainment
const mockCLOData = [
  { clo: 'CLO1', description: 'Understand basic concepts', attainment: 85, status: 'Achieved' },
  { clo: 'CLO2', description: 'Apply algorithms', attainment: 78, status: 'Partially Achieved' },
  { clo: 'CLO3', description: 'Analyze complexity', attainment: 92, status: 'Achieved' },
]

export default function CLOAttainment() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>CLO Attainment</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CLO</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Attainment (%)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCLOData.map((item) => (
                <TableRow key={item.clo}>
                  <TableCell>{item.clo}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.attainment}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}