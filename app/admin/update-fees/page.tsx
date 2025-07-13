"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function UpdateFees() {
  const [formData, setFormData] = useState({
    program: "",
    yearOfAdmission: "",
    examFee: "",
    dueDate: "",
    tuitionFee: "",
    labFee: "",
    libraryFee: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          yearOfAdmission: Number.parseInt(formData.yearOfAdmission),
          examFee: Number.parseInt(formData.examFee),
          tuitionFee: Number.parseInt(formData.tuitionFee) || 50000,
          labFee: Number.parseInt(formData.labFee) || 5000,
          libraryFee: Number.parseInt(formData.libraryFee) || 2000,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: "Success", description: "Fees updated successfully" })
        setFormData({
          program: "",
          yearOfAdmission: "",
          examFee: "",
          dueDate: "",
          tuitionFee: "",
          labFee: "",
          libraryFee: "",
        })
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Update Student Fees</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Fee Structure Management</CardTitle>
          <CardDescription>Set fee amounts and due dates for different programs</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  type="text"
                  placeholder="e.g., BS Computer Science"
                  value={formData.program}
                  onChange={(e) => setFormData((prev) => ({ ...prev, program: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearOfAdmission">Year of Admission</Label>
                <Input
                  id="yearOfAdmission"
                  type="number"
                  placeholder="e.g., 2023"
                  value={formData.yearOfAdmission}
                  onChange={(e) => setFormData((prev) => ({ ...prev, yearOfAdmission: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tuitionFee">Tuition Fee</Label>
                <Input
                  id="tuitionFee"
                  type="number"
                  placeholder="50000"
                  value={formData.tuitionFee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tuitionFee: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examFee">Exam Fee</Label>
                <Input
                  id="examFee"
                  type="number"
                  placeholder="e.g., 5000"
                  value={formData.examFee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, examFee: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="labFee">Lab Fee</Label>
                <Input
                  id="labFee"
                  type="number"
                  placeholder="5000"
                  value={formData.labFee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, labFee: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="libraryFee">Library Fee</Label>
                <Input
                  id="libraryFee"
                  type="number"
                  placeholder="2000"
                  value={formData.libraryFee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, libraryFee: e.target.value }))}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating Fees..." : "Update Fees"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
