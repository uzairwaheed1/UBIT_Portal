"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList } from "lucide-react"

export default function Assessments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Plan Assessments</h1>
        <p className="text-gray-600 mt-2">Create and manage course assessments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessments</CardTitle>
          <CardDescription>Plan and schedule your course assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments planned</h3>
            <p className="text-gray-600">Start planning your assessments by creating a new assessment plan.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

