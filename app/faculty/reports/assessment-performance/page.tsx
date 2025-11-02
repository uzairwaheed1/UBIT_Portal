'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Mock data for assessment performance
const mockData = [
  { name: 'Quiz 1', score: 75 },
  { name: 'Midterm', score: 82 },
  { name: 'Assignment', score: 68 },
  { name: 'Final', score: 90 },
]

export default function AssessmentPerformance() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-4 text-sm text-muted-foreground">Mock chart showing average scores for different assessments.</p>
        </CardContent>
      </Card>
    </div>
  )
}