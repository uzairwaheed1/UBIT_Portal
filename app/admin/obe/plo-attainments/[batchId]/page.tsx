'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { StudentPLOTable } from "@/components/plo-attainments/StudentPLOTable"
import { getBatchPLOAttainments, type BatchPLOResponse } from "@/lib/api/plo-attainments-service"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function BatchPLOAttainmentsPage() {
  const params = useParams()
  const router = useRouter()
  const rawBatchId = params.batchId as string | undefined
  const batchId = rawBatchId != null && rawBatchId !== "" ? Number(rawBatchId) : NaN
  const isValidBatchId = Number.isInteger(batchId) && batchId >= 1

  const [data, setData] = useState<BatchPLOResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!isValidBatchId) {
        setError("Invalid batch.")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const response = await getBatchPLOAttainments(batchId)
        setData(response)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load batch data."
        const is404 = message === "Batch not found" || message === "Invalid batch id"
        setError(is404 ? "Batch not found." : "Failed to load batch data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [batchId, isValidBatchId])

  if (loading && isValidBatchId) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !data || !isValidBatchId) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error ?? (!isValidBatchId ? "Invalid batch." : "Batch not found.")}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const averageAchievement =
    data.students.length > 0
      ? data.students.reduce((sum, s) => sum + s.overall_achievement.achievement_percentage, 0) /
        data.students.length
      : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{data.batch.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{data.batch.year}</Badge>
              <span className="text-sm text-muted-foreground">{data.batch.program_name}</span>
            </div>
          </div>
        </div>

        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Total Students</div>
          <div className="text-2xl font-bold mt-1">{data.students.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Total PLOs</div>
          <div className="text-2xl font-bold mt-1">12</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Avg Achievement</div>
          <div className="text-2xl font-bold mt-1">{averageAchievement.toFixed(1)}%</div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Student PLO Attainments</h2>
        <StudentPLOTable students={data.students} batchId={data.batch.id} />
      </div>
    </div>
  )
}

