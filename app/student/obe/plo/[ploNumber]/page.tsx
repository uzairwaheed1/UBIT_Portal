"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { obeService } from "@/lib/services/obe-service"
import type { PLODetail } from "@/lib/types/obe"
import { PLODetailComponent } from "@/components/obe/plo-detail"

export default function PLODetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const ploNumber = (params.ploNumber as string) || ""
  const [ploDetail, setPloDetail] = useState<PLODetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id && ploNumber) {
      fetchPLODetail()
    }
  }, [user, ploNumber])

  const fetchPLODetail = async () => {
    try {
      const data = await obeService.getPLODetail(user?.id?.toString() || "", ploNumber)
      setPloDetail(data)
    } catch (error) {
      console.error("Error fetching PLO detail:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/student/obe")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading PLO details...</p>
        </div>
      </div>
    )
  }

  if (!ploDetail) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">Unable to load PLO details</p>
      </div>
    )
  }

  return <PLODetailComponent ploDetail={ploDetail} onBack={handleBack} />
}
