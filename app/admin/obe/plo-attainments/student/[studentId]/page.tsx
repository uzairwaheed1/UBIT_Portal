'use client'

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { getStudentPLODetail, type StudentPLODetailResponse } from "@/lib/api/plo-attainments-service"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function StudentPLODetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawId = params.studentId as string | undefined
  const studentId = rawId != null && rawId !== "" ? Number(rawId) : NaN
  const isValidId = Number.isInteger(studentId) && studentId >= 1
  const batchId = useMemo(() => {
    const b = searchParams.get("batchId")
    return b != null && b !== "" ? Number(b) : NaN
  }, [searchParams])

  const [data, setData] = useState<StudentPLODetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!isValidId) {
        setError("Invalid student.")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const res = await getStudentPLODetail(studentId)
        setData(res)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load student."
        const is404 = msg === "Student not found" || msg === "Invalid student id"
        setError(is404 ? "Student not found." : "Failed to load student details. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [studentId, isValidId])

  const backToBatch =
    Number.isInteger(batchId) && batchId >= 1
      ? `/admin/obe/plo-attainments/${batchId}`
      : "/admin/obe/plo-attainments"

  if (loading && isValidId) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !data || !isValidId) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error ?? (!isValidId ? "Invalid student." : "Student not found.")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { student, plo_attainments, summary } = data
  const ploMap = new Map(plo_attainments.map((p) => [p.plo_number, p]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={backToBatch}>
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to batch
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{student.student_name}</h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <span>{student.roll_no}</span>
              {student.program_name ? <span>· {student.program_name}</span> : null}
              {student.batch_name ? <Badge variant="secondary">{student.batch_name}</Badge> : null}
            </div>
          </div>
        </div>
        <Badge variant={summary.achievement_percentage >= 70 ? "default" : "destructive"}>
          {summary.achievement_percentage.toFixed(1)}% · {summary.achieved_plos}/{summary.total_plos} PLOs
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Total PLOs</div>
          <div className="text-2xl font-bold mt-1">{summary.total_plos}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Achieved PLOs</div>
          <div className="text-2xl font-bold mt-1">{summary.achieved_plos}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Achievement %</div>
          <div className="text-2xl font-bold mt-1">{summary.achievement_percentage.toFixed(1)}%</div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">PLO-wise attainment</h2>
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3">PLO</th>
                <th className="text-center p-3">Attainment %</th>
                <th className="text-center p-3">Status</th>
                <th className="text-left p-3">Level</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => {
                const p = ploMap.get(n)
                if (!p) {
                  return (
                    <tr key={n} className="border-b">
                      <td className="p-3 font-medium">PLO-{n}</td>
                      <td className="p-3 text-center text-muted-foreground">–</td>
                      <td className="p-3 text-center text-muted-foreground">–</td>
                      <td className="p-3 text-muted-foreground">–</td>
                    </tr>
                  )
                }
                // PLO is achieved if average_attainment >= 50%
                const isAchieved = p.average_attainment >= 50
                const bg = isAchieved ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                return (
                  <tr key={n} className={`border-b ${bg}`}>
                    <td className="p-3 font-medium">PLO-{n}</td>
                    <td className="p-3 text-center font-medium">{p.average_attainment.toFixed(1)}%</td>
                    <td className="p-3 text-center">
                      {isAchieved ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 inline" />
                      )}
                    </td>
                    <td className="p-3">{p.achievement_level}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
