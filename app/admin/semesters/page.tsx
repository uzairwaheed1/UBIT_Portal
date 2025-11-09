"use client"

import React from "react"
import dynamic from "next/dynamic"

const SemesterManager = dynamic(
  () => import("@/components/admin/semesters/SemesterManager"),
  { ssr: false }
)

export default function SemestersPage() {
  return (
    <SemesterManager />
  )
}