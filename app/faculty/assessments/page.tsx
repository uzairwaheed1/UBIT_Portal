'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Assessments() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Assessments Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This is the main assessments page. Use the links below to navigate:</p>
          <div className="flex flex-col space-y-2">
            <Link href="/faculty/assessments/roadmap">
              <Button variant="outline" className="w-full">Assessment Roadmap</Button>
            </Link>
            <Link href="/faculty/assessments/manage">
              <Button variant="outline" className="w-full">Manage Assessments</Button>
            </Link>
            <Link href="/faculty/assessments/create">
              <Button variant="outline" className="w-full">Create Assessment</Button>
            </Link>
            <Link href="/faculty/assessments/view">
              <Button variant="outline" className="w-full">View Assessments</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}