'use client'

import { useEffect, useState } from "react"
import { BatchCard } from "@/components/plo-attainments/BatchCard"
import { getBatchesWithPLOData, type BatchWithPLOData } from "@/lib/api/plo-attainments-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function PLOAttainmentsPage() {
  const [batches, setBatches] = useState<BatchWithPLOData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBatches() {
      try {
        setLoading(true)
        setError(null)
        const data = await getBatchesWithPLOData()
        setBatches(data)
      } catch (err) {
        console.error("Error fetching batches:", err)
        setError("Failed to load batches. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchBatches()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">PLO Attainments</h1>
        <p className="text-muted-foreground mt-2">
          View Program-Level Outcome attainments for students across different batches
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          {batches.length === 0 ? (
            <Alert>
              <AlertDescription>
                No batch data available. Upload course results to see PLO attainments.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batches.map((batch) => (
                <BatchCard key={batch.batch_id} {...batch} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

