"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import FacultyLayout from "@/components/faculty-layout"
import { useToast } from "@/hooks/use-toast"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/")
    } else if (user.role !== "Faculty") {
      router.push("/")
      toast({ title: "Access denied", description: "Faculty access required", variant: "destructive" })
    }
  }, [user, router, toast])

  if (!user || user.role !== "Faculty") {
    return null
  }

  return <FacultyLayout>{children}</FacultyLayout>
}

