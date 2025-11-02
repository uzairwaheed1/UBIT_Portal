'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timeline } from "@/components/ui/timeline" // Assuming a Timeline component exists or needs to be created

// Mock data for assessment roadmap
const mockRoadmap = [
  { date: "Week 1", event: "Course Introduction", type: "Lecture" },
  { date: "Week 4", event: "Quiz 1", type: "Assessment" },
  { date: "Week 8", event: "Midterm Exam", type: "Assessment" },
  { date: "Week 12", event: "Project Submission", type: "Assignment" },
  { date: "Week 16", event: "Final Exam", type: "Assessment" },
]

export default function AssessmentRoadmap() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline items={mockRoadmap.map(item => ({
            title: item.date,
            content: `${item.type}: ${item.event}`
          }))} />
          <p className="mt-4 text-sm text-muted-foreground">This is a mock roadmap of assessments for the course.</p>
        </CardContent>
      </Card>
    </div>
  )
}