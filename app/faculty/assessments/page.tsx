'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'

// Define CLO data with mappings and total marks
const cloData = [
  { plo: 'PLO1', clo: 'CLO1', totalMarks: 30 },
  { plo: 'PLO2', clo: 'CLO2', totalMarks: 25 },
  { plo: 'PLO3', clo: 'CLO3', totalMarks: 45 },
  { plo: 'PLO4', clo: 'CLO4', totalMarks: 50 },
]

export default function Assessments() {
  const [marks, setMarks] = useState(cloData.map(() => 0))
  const [attainments, setAttainments] = useState(cloData.map(() => 0))

  useEffect(() => {
    const newAttainments = marks.map((mark: number, index: number) => 
      (mark / cloData[index].totalMarks) * 100
    )
    setAttainments(newAttainments)
  }, [marks])

  const handleMarkChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0
    setMarks((prev: number[]) => {
      const newMarks = [...prev]
      newMarks[index] = Math.min(numValue, cloData[index].totalMarks)
      return newMarks
    })
  }

  // Calculate PLO attainments (average since one CLO per PLO)
  const ploAttainments = cloData.reduce((acc, item, index) => {
    acc[item.plo] = attainments[index]
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(ploAttainments).map(([plo, attainment]) => ({ plo, attainment }))

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Assessments Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This is the main assessments page. Use the links below to navigate:</p>
          <div className="flex flex-col space-y-2">
            <Link href="/faculty/assessments/roadmap">
              <Button variant="outline" className="w-full">Assessment Roadmap</Button>
            </Link>
            <Link href="/faculty/assessments/manage">
              <Button variant="outline" className="w-full">Manage Assessments</Button>
            </Link>
            <Link href="/faculty/assessments/create">
              <Button variant="outline" className="w-full">Create Assessment</Button>
            </Link>
            <Link href="/faculty/assessments/view">
              <Button variant="outline" className="w-full">View Assessments</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>PLO–CLO Attainment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">PLO</th>
                  <th className="p-2 text-left">CLO</th>
                  <th className="p-2 text-left">Marks Obtained</th>
                  <th className="p-2 text-left">Total Marks</th>
                  <th className="p-2 text-left">Attainment (%)</th>
                </tr>
              </thead>
              <tbody>
                {cloData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>{item.plo}</TooltipTrigger>
                          <TooltipContent>{`${item.clo} linked to ${item.plo}`}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="p-2">{item.clo}</td>
                    <td className="p-2">
                      <Input 
                        type="number"
                        value={marks[index]}
                        onChange={(e) => handleMarkChange(index, e.target.value)}
                        max={item.totalMarks}
                        className="w-24"
                      />
                    </td>
                    <td className="p-2">{item.totalMarks}</td>
                    <td className="p-2">{attainments[index].toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">PLO Attainment Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(ploAttainments).map(([plo, attainment]) => (
                <Card key={plo}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">{plo}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{attainment.toFixed(2)}%</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Attainment Visualization</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plo" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="attainment" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}