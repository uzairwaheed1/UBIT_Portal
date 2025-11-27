"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart } from "lucide-react"

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">Generate and view academic reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academic Reports</CardTitle>
          <CardDescription>Generate and download various academic reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated</h3>
            <p className="text-gray-600">Generate reports based on your course data and student performance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

