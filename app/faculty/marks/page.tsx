'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MarksEntry() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Marks Entry Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This is the main marks entry page. Use the links below to navigate:</p>
          <div className="flex flex-col space-y-2">
            <Link href="/faculty/marks/entry">
              <Button variant="outline" className="w-full">Manual Entry</Button>
            </Link>
            <Link href="/faculty/marks/bulk-upload">
              <Button variant="outline" className="w-full">Bulk Upload</Button>
            </Link>
            <Link href="/faculty/marks/view">
              <Button variant="outline" className="w-full">View Marks</Button>
            </Link>
            <Link href="/faculty/marks/lock-evaluation">
              <Button variant="outline" className="w-full">Lock Evaluation</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}