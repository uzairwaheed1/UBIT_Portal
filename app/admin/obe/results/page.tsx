"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, GraduationCap, ArrowRight } from "lucide-react"
import { getBatchesWithResults, type BatchWithResults } from "@/lib/obe-results-service"

export default function OBEResultsPage() {
  const [batches, setBatches] = useState<BatchWithResults[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const data = await getBatchesWithResults()
      setBatches(data)
    } catch (error) {
      console.error("Error fetching batches:", error)
      // Don't show error toast if it's a 404 - backend might not be implemented yet
      if (error instanceof Error && !error.message.includes("404")) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch batches with results",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">OBE Results Management</h1>
          <p className="text-gray-600 mt-2">Upload and manage course OBE results</p>
        </div>
        <Link href="/admin/obe/results/upload">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" />
            Upload Results
          </Button>
        </Link>
      </div>

      {/* Upload Results Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload New Results
          </CardTitle>
          <CardDescription>Upload Excel file with student PLO attainment data</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/obe/results/upload">
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Go to Upload Page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Uploaded Results Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Uploaded Results</h2>
        <p className="text-gray-600 mb-6">View previously uploaded course results by batch</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : batches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg mb-2">No results uploaded yet</p>
              <p className="text-gray-500 text-sm mb-4">Upload your first batch of results to get started</p>
              <Link href="/admin/obe/results/upload">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Results
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <Card key={batch.batch_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    {batch.batch_name}
                  </CardTitle>
                  <CardDescription>
                    {batch.courses_count} {batch.courses_count === 1 ? "course" : "courses"} uploaded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/admin/obe/results/batch/${batch.batch_id}`}>
                    <Button variant="outline" className="w-full">
                      View Batch Results
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

