"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet } from "lucide-react"

export default function MarksEntry() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marks Entry</h1>
        <p className="text-gray-600 mt-2">Enter and manage student marks and grades</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marks Entry</CardTitle>
          <CardDescription>Record student marks for assessments and exams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No marks to enter</h3>
            <p className="text-gray-600">Marks entry interface will be available once assessments are created.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

