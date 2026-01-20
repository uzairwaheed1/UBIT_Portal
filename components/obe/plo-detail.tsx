"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { PLODetail } from "@/lib/types/obe"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"

interface PLODetailProps {
  ploDetail: PLODetail
  onBack?: () => void
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
}

export function PLODetailComponent({ ploDetail, onBack }: PLODetailProps) {
  // Prepare chart data
  const chartData = ploDetail.courses.map((course) => ({
    course: course.course_code,
    score: course.score,
    fullName: course.course_title,
  }))

  // Color coding function
  const getColor = (score: number) => {
    if (score >= 70) return "hsl(142, 76%, 36%)" // Green
    if (score >= 50) return "hsl(38, 92%, 50%)" // Yellow
    return "hsl(0, 84%, 60%)" // Red
  }

  const averageColor = getColor(ploDetail.average)

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {ploDetail.ploNumber.toUpperCase()}: {ploDetail.ploTitle}
              </CardTitle>
              <CardDescription className="mt-2">
                Detailed breakdown of your performance in this Program Learning Outcome
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: averageColor }}>
                {ploDetail.average}%
              </div>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Average Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Average</span>
              <Badge
                variant={
                  ploDetail.average >= 70
                    ? "default"
                    : ploDetail.average >= 50
                    ? "secondary"
                    : "destructive"
                }
              >
                {ploDetail.average >= 70
                  ? "Target Achieved"
                  : ploDetail.average >= 50
                  ? "Needs Improvement"
                  : "Below Target"}
              </Badge>
            </div>
            <Progress value={ploDetail.average} className="h-3" />
          </div>

          {/* Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Course-wise Performance</h3>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis
                    dataKey="course"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    label={{ value: "Score (%)", angle: -90, position: "insideLeft" }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="font-medium">{data.fullName}</div>
                              <div className="text-sm">
                                <span className="font-semibold">{data.course}:</span> {data.score}%
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Course Details Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contributing Courses</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ploDetail.courses.map((course, index) => {
                    const color = getColor(course.score)
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{course.course_code}</TableCell>
                        <TableCell>{course.course_title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Semester {course.semester}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold" style={{ color }}>
                          {course.score}%
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              course.score >= 70
                                ? "default"
                                : course.score >= 50
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {course.score >= 70
                              ? "✓ Achieved"
                              : course.score >= 50
                              ? "⚠ Moderate"
                              : "✗ Low"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Average Calculation Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2">Average Calculation</h4>
                  <p className="text-sm text-muted-foreground">
                    The average score of {ploDetail.average}% is calculated from{" "}
                    {ploDetail.courses.length} course(s) that contribute to this PLO. This
                    represents your overall attainment level for {ploDetail.ploNumber.toUpperCase()}
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
