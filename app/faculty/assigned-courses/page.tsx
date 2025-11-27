"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default function AssignedCourses() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assigned Courses</h1>
        <p className="text-gray-600 mt-2">View and manage your assigned courses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>Courses assigned to you for the current semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses assigned</h3>
            <p className="text-gray-600">You don't have any courses assigned yet. Contact the administration for course assignments.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

