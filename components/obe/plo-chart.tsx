"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import type { ProgramPLOs } from "@/lib/types/obe"

interface PLOChartProps {
  programPLOs: ProgramPLOs
}

const chartConfig = {
  plo: {
    label: "PLO Score",
    color: "hsl(var(--chart-1))",
  },
}

export function PLOChart({ programPLOs }: PLOChartProps) {
  // Convert PLOs object to array for chart
  const ploData = Object.entries(programPLOs).map(([key, value]) => ({
    plo: key.toUpperCase(),
    score: Math.round(value * 10) / 10,
  }))

  // Color coding function
  const getColor = (score: number) => {
    if (score >= 70) return "hsl(142, 76%, 36%)" // Green
    if (score >= 50) return "hsl(38, 92%, 50%)" // Yellow
    return "hsl(0, 84%, 60%)" // Red
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Program-Level PLO Performance</CardTitle>
        <CardDescription>
          Your performance across all 12 Program Learning Outcomes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ploData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                dataKey="plo"
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
                    const data = payload[0]
                    const score = data.value as number
                    const color = getColor(score)
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium">{data.payload.plo}</span>
                            <span
                              className="text-sm font-bold"
                              style={{ color }}
                            >
                              {score}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {score >= 70
                              ? "✓ Target Achieved"
                              : score >= 50
                              ? "⚠ Needs Improvement"
                              : "✗ Below Target"}
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {ploData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-600"></div>
            <span>Target Achieved (≥70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span>Needs Improvement (50-70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span>Below Target (&lt;50%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
