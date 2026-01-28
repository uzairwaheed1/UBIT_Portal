'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap } from "lucide-react"
import Link from "next/link"

interface BatchCardProps {
  batch_id: number
  batch_name: string
  batch_year: number
  program_name: string
  student_count: number
}

export function BatchCard({ batch_id, batch_name, batch_year, program_name, student_count }: BatchCardProps) {
  return (
    <Link href={`/admin/obe/plo-attainments/${batch_id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">{batch_name}</CardTitle>
            <Badge variant="secondary">{batch_year}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span className="line-clamp-1">{program_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-blue-600" />
            <span>{student_count} Students</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

