"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCLOsByCourseId, CLO } from "@/lib/clo-service"
import { getPlosByProgramId, PLO } from "@/lib/plo-service"
import { createBulkCloPloMappings, getCloPloMappingsByCourseId } from "@/lib/clo-plo-mapping-service"
import { Loader2, Network } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CloPloMappingInlineProps {
  courseId: number
  programId: number
}

// Bloom's domains
const BLOOMS_DOMAINS = [
  { value: "C", label: "Cognitive" },
  { value: "P", label: "Psychomotor" },
  { value: "A", label: "Affective" },
]

// Bloom's levels (1-6)
const BLOOMS_LEVELS = [
  { value: "1", label: "1 - Remember" },
  { value: "2", label: "2 - Understand" },
  { value: "3", label: "3 - Apply" },
  { value: "4", label: "4 - Analyze" },
  { value: "5", label: "5 - Evaluate" },
  { value: "6", label: "6 - Create" },
]

interface MappingCell {
  domain: string
  level: string
  weightage: string
}

type MappingState = Record<string, MappingCell>

export function CloPloMappingInline({ courseId, programId }: CloPloMappingInlineProps) {
  const [showMapping, setShowMapping] = useState(false)
  const [mappings, setMappings] = useState<MappingState>({})
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Fetch CLOs for the course
  const {
    data: clos = [],
    isLoading: closLoading,
    error: closError,
  } = useQuery({
    queryKey: ["clos", courseId],
    queryFn: () => getCLOsByCourseId(courseId),
    enabled: showMapping && !!courseId,
  })

  // Fetch PLOs for the program
  const {
    data: plos = [],
    isLoading: plosLoading,
    error: plosError,
  } = useQuery({
    queryKey: ["plos", programId],
    queryFn: () => getPlosByProgramId(programId),
    enabled: showMapping && !!programId,
  })

  // Fetch existing mappings
  const { data: existingMappings = [] } = useQuery({
    queryKey: ["clo-plo-mappings", courseId],
    queryFn: () => getCloPloMappingsByCourseId(courseId),
    enabled: showMapping && !!courseId,
  })

  // Load existing mappings into state
  useEffect(() => {
    if (existingMappings.length > 0) {
      const initialMappings: MappingState = {}
      existingMappings.forEach((mapping) => {
        const key = `${mapping.clo_id}-${mapping.plo_id}`
        initialMappings[key] = {
          domain: mapping.domain,
          level: mapping.level.toString(),
          weightage: mapping.weightage.toString(),
        }
      })
      setMappings(initialMappings)
    }
  }, [existingMappings])

  const isLoading = closLoading || plosLoading

  // Update a specific cell's data
  const updateMapping = (cloId: number, ploId: number, field: keyof MappingCell, value: string) => {
    const key = `${cloId}-${ploId}`
    setMappings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        domain: prev[key]?.domain || "",
        level: prev[key]?.level || "",
        weightage: prev[key]?.weightage || "",
        [field]: value,
      },
    }))
  }

  // Build payload and save
  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Build the payload structure
      const mappingsData: Record<
        number,
        { plo_id: number; domain: string; level: number; weightage: number }[]
      > = {}

      // Group mappings by CLO
      Object.entries(mappings).forEach(([key, cell]) => {
        const [cloIdStr, ploIdStr] = key.split("-")
        const cloId = Number.parseInt(cloIdStr)
        const ploId = Number.parseInt(ploIdStr)

        // Only include mappings that have both domain and level set
        if (cell.domain && cell.level) {
          if (!mappingsData[cloId]) {
            mappingsData[cloId] = []
          }
          mappingsData[cloId].push({
            plo_id: ploId,
            domain: cell.domain,
            level: Number.parseInt(cell.level),
            weightage: cell.weightage ? Number.parseFloat(cell.weightage) : 0,
          })
        }
      })

      // Convert to the required format
      const payload = {
        course_id: courseId,
        mappings: Object.entries(mappingsData).map(([cloId, ploMappings]) => ({
          clo_id: Number.parseInt(cloId),
          plo_mappings: ploMappings,
        })),
      }

      console.log("Payload:", JSON.stringify(payload, null, 2))

      // Call API
      const result = await createBulkCloPloMappings(payload)

      toast({
        title: "Success",
        description: result.message || "CLO-PLO mappings saved successfully",
      })

      console.log("CLO-PLO Mapping Saved:", JSON.stringify(payload, null, 2))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save CLO-PLO mappings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!showMapping) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CLO-PLO Mapping</CardTitle>
          <CardDescription>
            Map Course Learning Outcomes (CLOs) to Program Learning Outcomes (PLOs) for this course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowMapping(true)}>
            <Network className="mr-2 h-4 w-4" />
            CLO-PLO Mapping
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>CLO-PLO Mapping</CardTitle>
        <CardDescription>
          Map Course Learning Outcomes (CLOs) to Program Learning Outcomes (PLOs). Select Bloom's domain,
          level, and optionally define weightage for each mapping.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading CLOs and PLOs...</span>
          </div>
        ) : closError || plosError ? (
          <div className="text-center py-12 text-red-600">
            Error loading data: {closError?.message || plosError?.message}
          </div>
        ) : clos.length === 0 || plos.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            {clos.length === 0 && "No CLOs found for this course. "}
            {plos.length === 0 && "No PLOs found for this program. "}
            Please create CLOs and PLOs before mapping.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold sticky left-0 bg-gray-100 z-10 min-w-[200px]">
                      CLO / PLO
                    </th>
                    {plos.map((plo) => (
                      <th
                        key={plo.id}
                        className="border border-gray-300 p-3 text-center font-semibold min-w-[220px]"
                      >
                        <div className="font-bold">{plo.code}</div>
                        <div className="text-xs font-normal text-gray-600 mt-1">{plo.title}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clos.map((clo) => (
                    <tr key={clo.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3 font-medium sticky left-0 bg-white z-10">
                        <div className="font-bold">CLO-{clo.clo_number}</div>
                        <div className="text-xs text-gray-600 mt-1 max-w-[200px]">
                          {clo.description}
                        </div>
                      </td>
                      {plos.map((plo) => {
                        const key = `${clo.id}-${plo.id}`
                        const cellData = mappings[key] || { domain: "", level: "", weightage: "" }

                        return (
                          <td key={plo.id} className="border border-gray-300 p-2">
                            <div className="space-y-2">
                              {/* Domain Select */}
                              <div>
                                <Label className="text-xs text-gray-600">Domain</Label>
                                <Select
                                  value={cellData.domain || undefined}
                                  onValueChange={(value) =>
                                    updateMapping(clo.id, plo.id, "domain", value)
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {BLOOMS_DOMAINS.map((domain) => (
                                      <SelectItem key={domain.value} value={domain.value}>
                                        {domain.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Level Select */}
                              <div>
                                <Label className="text-xs text-gray-600">Level</Label>
                                <Select
                                  value={cellData.level || undefined}
                                  onValueChange={(value) =>
                                    updateMapping(clo.id, plo.id, "level", value)
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {BLOOMS_LEVELS.map((level) => (
                                      <SelectItem key={level.value} value={level.value}>
                                        {level.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Weightage Input */}
                              <div>
                                <Label className="text-xs text-gray-600">Weightage</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="1"
                                  placeholder="0.0"
                                  value={cellData.weightage}
                                  onChange={(e) =>
                                    updateMapping(clo.id, plo.id, "weightage", e.target.value)
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Mapping"
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowMapping(false)}>
                Hide Mapping
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
