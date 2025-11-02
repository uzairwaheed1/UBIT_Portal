'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BulkUpload() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload Marks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Upload CSV File</Label>
              <Input id="file" type="file" accept=".csv" />
            </div>
            <Button>Upload and Process</Button>
            <p className="text-sm text-muted-foreground">Mock upload: Selected file will be logged to console.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}