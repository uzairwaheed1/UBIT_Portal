'use client'

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"
import type { StudentPLOData } from "@/lib/api/plo-attainments-service"

interface StudentPLOTableProps {
  students: StudentPLOData[]
  /** Optional batch ID for "Back to batch" when opening student detail */
  batchId?: number
}

export function StudentPLOTable({ students, batchId }: StudentPLOTableProps) {
  const studentHref = (studentId: number) => {
    const q = batchId != null ? `?batchId=${batchId}` : ""
    return `/admin/obe/plo-attainments/student/${studentId}${q}`
  }

  // Column widths for sticky positioning
  const ROLL_NO_WIDTH = 120
  const NAME_WIDTH = 200
  const NAME_LEFT = ROLL_NO_WIDTH

  return (
    <div className="w-full rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow>
              {/* Sticky Roll No column */}
              <TableHead
                className="sticky left-0 z-20 bg-background border-r shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                style={{ width: `${ROLL_NO_WIDTH}px`, minWidth: `${ROLL_NO_WIDTH}px` }}
              >
                Roll No
              </TableHead>
              {/* Sticky Name column */}
              <TableHead
                className="sticky z-20 bg-background border-r shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                style={{ left: `${NAME_LEFT}px`, width: `${NAME_WIDTH}px`, minWidth: `${NAME_WIDTH}px` }}
              >
                Student Name
              </TableHead>
              {/* Scrollable PLO columns */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <TableHead key={num} className="text-center min-w-[100px]">
                  PLO-{num}
                </TableHead>
              ))}
              {/* Overall column */}
              <TableHead className="text-center min-w-[120px]">Overall</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center text-muted-foreground">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                const ploMap = new Map(student.plo_attainments.map((plo) => [plo.plo_number, plo]))

                return (
                  <TableRow key={student.student_id} className="group hover:bg-muted/50">
                    {/* Sticky Roll No cell */}
                    <TableCell
                      className="font-medium sticky left-0 z-10 bg-background group-hover:bg-muted/50 border-r shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                      style={{ width: `${ROLL_NO_WIDTH}px`, minWidth: `${ROLL_NO_WIDTH}px` }}
                    >
                      {student.roll_no}
                    </TableCell>
                    {/* Sticky Name cell */}
                    <TableCell
                      className="sticky z-10 bg-background group-hover:bg-muted/50 border-r shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                      style={{ left: `${NAME_LEFT}px`, width: `${NAME_WIDTH}px`, minWidth: `${NAME_WIDTH}px` }}
                    >
                      <Link
                        href={studentHref(student.student_id)}
                        className="text-primary hover:underline font-medium"
                      >
                        {student.student_name}
                      </Link>
                    </TableCell>

                    {/* Scrollable PLO cells */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((ploNum) => {
                      const plo = ploMap.get(ploNum)

                      if (!plo) {
                        return (
                          <TableCell key={ploNum} className="text-center text-muted-foreground min-w-[100px]">
                            -
                          </TableCell>
                        )
                      }

                      // PLO is achieved if average_attainment >= 50%
                      const isAchieved = plo.average_attainment >= 50
                      const bgColor = isAchieved ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"

                      return (
                        <TableCell key={ploNum} className={`text-center ${bgColor} min-w-[100px]`}>
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-medium">{plo.average_attainment.toFixed(1)}%</span>
                            {isAchieved ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                          </div>
                        </TableCell>
                      )
                    })}

                    {/* Overall cell */}
                    <TableCell className="text-center min-w-[120px]">
                      <Badge
                        variant={
                          student.overall_achievement.achievement_percentage >= 70 ? "default" : "destructive"
                        }
                      >
                        {student.overall_achievement.achievement_percentage.toFixed(1)}%
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {student.overall_achievement.achieved_plos}/{student.overall_achievement.total_plos} PLOs
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

