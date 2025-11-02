'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState } from "react"

export default function LockEvaluation() {
  const [isLocked, setIsLocked] = useState(false)

  const handleLock = () => {
    setIsLocked(true)
    // Mock lock action
    console.log("Evaluation locked")
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Lock Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Lock the current evaluation period to prevent further changes.</p>
          {!isLocked ? (
            <Button onClick={handleLock} variant="destructive">Lock Evaluation</Button>
          ) : (
            <Alert>
              <AlertTitle>Evaluation Locked</AlertTitle>
              <AlertDescription>The evaluation has been successfully locked.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}