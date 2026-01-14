"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { CourseOfferingList } from "@/components/course-offering-list"
import { getAllBatches } from "@/lib/batch-service"
import {
  getCourseOfferings,
  type CourseOfferingFilters,
  type CourseOfferingListResponse,
} from "@/lib/course-offering-service"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2 } from "lucide-react"

export default function CourseOfferingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [filters, setFilters] = useState<CourseOfferingFilters>({
    page: 1,
    limit: 10,
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Check if user has permission
  useEffect(() => {
    if (user && user.role !== "Admin" && user.role !== "SuperAdmin") {
      router.push("/admin")
    }
  }, [user, router])

  // Fetch batches
  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: getAllBatches,
  })

  // Fetch course offerings with filters
  const {
    data: offeringsData,
    isLoading: offeringsLoading,
    error: offeringsError,
  } = useQuery({
    queryKey: ["course-offerings", filters],
    queryFn: () => getCourseOfferings(filters),
  })

  // Handle response structure
  const offerings = Array.isArray(offeringsData)
    ? offeringsData
    : (offeringsData as CourseOfferingListResponse)?.data || []
  const totalPages =
    Array.isArray(offeringsData)
      ? 1
      : (offeringsData as CourseOfferingListResponse)?.totalPages || 1
  const currentPageFromData =
    Array.isArray(offeringsData)
      ? 1
      : (offeringsData as CourseOfferingListResponse)?.page || 1

  useEffect(() => {
    setCurrentPage(currentPageFromData)
  }, [currentPageFromData])

  // Handle errors
  useEffect(() => {
    if (offeringsError) {
      toast({
        title: "Error",
        description: "Failed to fetch course offerings",
        variant: "destructive",
      })
    }
  }, [offeringsError, toast])

  const handleFiltersChange = (newFilters: CourseOfferingFilters) => {
    setFilters(newFilters)
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
    setCurrentPage(page)
  }

  if (user && user.role !== "Admin" && user.role !== "SuperAdmin") {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Offerings</h1>
          <p className="text-gray-600 mt-2">Manage course offerings for batches and semesters</p>
        </div>
        <Button onClick={() => router.push("/admin/course-offerings/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Course Offering
        </Button>
      </div>

      {batchesLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CourseOfferingList
          offerings={offerings}
          batches={batches}
          onFiltersChange={handleFiltersChange}
          filters={filters}
          isLoading={offeringsLoading}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
