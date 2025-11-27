"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Map } from "lucide-react"

export default function CourseRoadmap() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Course Roadmap</h1>
        <p className="text-gray-600 mt-2">Plan and manage your course curriculum roadmap</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Roadmap</CardTitle>
          <CardDescription>View and edit your course curriculum structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No roadmap available</h3>
            <p className="text-gray-600">Course roadmap will be displayed here once courses are assigned.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

