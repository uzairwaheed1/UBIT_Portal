"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useToast } from "@/hooks/use-toast"
import { Settings, Save } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OBEConfig {
  _id?: string
  gradeThresholds: {
    A: number
    B: number
    C: number
    D: number
    F: number
  }
  passPercentage: number
  gradingScale: "Percentage" | "Letter" | "GPA"
  program: string
  isActive: boolean
}

export default function OBEConfiguration() {
  const [config, setConfig] = useState<OBEConfig>({
    gradeThresholds: {
      A: 90,
      B: 80,
      C: 70,
      D: 60,
      F: 0,
    },
    passPercentage: 60,
    gradingScale: "Percentage",
    program: "BS Computer Science",
    isActive: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/obe-config")
      const data = await response.json()
      if (data.success && data.config) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error("Failed to fetch config:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch("/api/obe-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "OBE configuration saved successfully",
        })
        setConfig(data.config)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save configuration",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>OBE Configuration</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">OBE Configuration</h1>
        <p className="text-gray-600 mt-1">C6 - Configure grading scales and thresholds</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Grade Thresholds</CardTitle>
              <CardDescription>
                Set the minimum percentage required for each grade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gradeA">Grade A (Minimum %)</Label>
                  <Input
                    id="gradeA"
                    type="number"
                    min="0"
                    max="100"
                    value={config.gradeThresholds.A}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        gradeThresholds: {
                          ...config.gradeThresholds,
                          A: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradeB">Grade B (Minimum %)</Label>
                  <Input
                    id="gradeB"
                    type="number"
                    min="0"
                    max="100"
                    value={config.gradeThresholds.B}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        gradeThresholds: {
                          ...config.gradeThresholds,
                          B: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradeC">Grade C (Minimum %)</Label>
                  <Input
                    id="gradeC"
                    type="number"
                    min="0"
                    max="100"
                    value={config.gradeThresholds.C}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        gradeThresholds: {
                          ...config.gradeThresholds,
                          C: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradeD">Grade D (Minimum %)</Label>
                  <Input
                    id="gradeD"
                    type="number"
                    min="0"
                    max="100"
                    value={config.gradeThresholds.D}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        gradeThresholds: {
                          ...config.gradeThresholds,
                          D: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradeF">Grade F (Minimum %)</Label>
                  <Input
                    id="gradeF"
                    type="number"
                    min="0"
                    max="100"
                    value={config.gradeThresholds.F}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        gradeThresholds: {
                          ...config.gradeThresholds,
                          F: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pass/Fail Criteria</CardTitle>
              <CardDescription>
                Configure the minimum percentage required to pass
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passPercentage">Pass Percentage (%)</Label>
                <Input
                  id="passPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={config.passPercentage}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      passPercentage: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
                <p className="text-sm text-gray-500">
                  Students must achieve at least this percentage to pass
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grading Scale</CardTitle>
              <CardDescription>
                Select the grading scale system to use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gradingScale">Grading Scale Type</Label>
                <Select
                  value={config.gradingScale}
                  onValueChange={(value: "Percentage" | "Letter" | "GPA") =>
                    setConfig({ ...config, gradingScale: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                    <SelectItem value="Letter">Letter Grade</SelectItem>
                    <SelectItem value="GPA">GPA Scale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  value={config.program}
                  onChange={(e) =>
                    setConfig({ ...config, program: e.target.value })
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

