"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Assessment {
  id: string
  name: string
  weight: number
  clo: string
  bloomLevel: string
}

const CLOs = [
  "CLO 1: Knowledge",
  "CLO 2: Comprehension", 
  "CLO 3: Application",
  "CLO 4: Analysis",
  "CLO 5: Synthesis",
  "CLO 6: Evaluation"
]

const BloomLevels = [
  "K1: Remember",
  "K2: Understand",
  "K3: Apply",
  "K4: Analyze",
  "K5: Evaluate",
  "K6: Create"
]

export default function CourseRoadmap() {
  const [sessionalAssessments, setSessionalAssessments] = useState<Assessment[]>([
    { id: "1", name: "Quiz 1", weight: 5, clo: CLOs[0], bloomLevel: BloomLevels[1] }
  ])
  const [flexibleAssessments, setFlexibleAssessments] = useState<Assessment[]>([
    { id: "2", name: "Project Presentation", weight: 15, clo: CLOs[2], bloomLevel: BloomLevels[4] }
  ])

  const calculateTotal = (assessments: Assessment[]) => {
    return assessments.reduce((sum, a) => sum + a.weight, 0)
  }

  const addAssessment = (type: "sessional" | "flexible") => {
    const newAssessment: Assessment = {
      id: Date.now().toString(),
      name: "",
      weight: 0,
      clo: CLOs[0],
      bloomLevel: BloomLevels[0]
    }

    if (type === "sessional") {
      setSessionalAssessments([...sessionalAssessments, newAssessment])
    } else {
      setFlexibleAssessments([...flexibleAssessments, newAssessment])
    }
  }

  const removeAssessment = (id: string, type: "sessional" | "flexible") => {
    if (type === "sessional") {
      setSessionalAssessments(sessionalAssessments.filter(a => a.id !== id))
    } else {
      setFlexibleAssessments(flexibleAssessments.filter(a => a.id !== id))
    }
  }

  const updateAssessment = (id: string, field: keyof Assessment, value: string | number, type: "sessional" | "flexible") => {
    const update = (assessments: Assessment[]) =>
      assessments.map(a => a.id === id ? { ...a, [field]: value } : a)

    if (type === "sessional") {
      setSessionalAssessments(update(sessionalAssessments))
    } else {
      setFlexibleAssessments(update(flexibleAssessments))
    }
  }

  const saveRoadmap = () => {
    const sessionalTotal = calculateTotal(sessionalAssessments)
    const flexibleTotal = calculateTotal(flexibleAssessments)
    const theoryTotal = sessionalTotal + flexibleTotal

    if (sessionalTotal !== 20) {
      toast({
        title: "Validation Error",
        description: `Sessional section must total exactly 20%. Current: ${sessionalTotal}%`,
        variant: "destructive"
      })
      return
    }

    if (theoryTotal !== 40) {
      toast({
        title: "Validation Error",
        description: `Theory component must total exactly 40%. Current: ${theoryTotal}%`,
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success",
      description: "Theory Component Roadmap saved successfully with CLO/Bloom tags."
    })
  }

  const renderAssessmentCard = (assessment: Assessment, type: "sessional" | "flexible") => (
    <div
      key={assessment.id}
      className={`border p-3 rounded-lg space-y-2 ${
        type === "sessional" ? "bg-indigo-50 border-indigo-300" : "bg-green-50 border-green-300"
      }`}
    >
      <div className="flex justify-between items-center">
        <Input
          placeholder="Assessment Name (e.g., Midterm)"
          value={assessment.name}
          onChange={(e) => updateAssessment(assessment.id, "name", e.target.value, type)}
          className="w-1/2"
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Weight (%)"
            min="1"
            max="20"
            value={assessment.weight}
            onChange={(e) => updateAssessment(assessment.id, "weight", parseInt(e.target.value) || 0, type)}
            className="w-20"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeAssessment(assessment.id, type)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex space-x-2">
        <Select
          value={assessment.clo}
          onValueChange={(value) => updateAssessment(assessment.id, "clo", value, type)}
        >
          <SelectTrigger className="w-1/2">
            <SelectValue placeholder="Link CLO(s)..." />
          </SelectTrigger>
          <SelectContent>
            {CLOs.map(clo => (
              <SelectItem key={clo} value={clo}>{clo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={assessment.bloomLevel}
          onValueChange={(value) => updateAssessment(assessment.id, "bloomLevel", value, type)}
        >
          <SelectTrigger className="w-1/2">
            <SelectValue placeholder="Link Bloom's Level..." />
          </SelectTrigger>
          <SelectContent>
            {BloomLevels.map(bloom => (
              <SelectItem key={bloom} value={bloom}>{bloom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Course Roadmap: 40% Theory Component Planning</h1>
        <p className="text-gray-600 mt-1">
          Define Sessional (20%) and Flexible (20%) assessments and map them to <strong>CLOs</strong> and <strong>Bloom's Levels</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sessional Section (20%) */}
        <Card className="border-l-4 border-indigo-500">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-700">
              Sessional Section (Required 20% Total)
              <span className="ml-2 text-sm font-normal text-gray-500">
                Current: {calculateTotal(sessionalAssessments)}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {sessionalAssessments.map(assessment => renderAssessmentCard(assessment, "sessional"))}
            </div>
            <Button
              variant="outline"
              className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              onClick={() => addAssessment("sessional")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sessional Assessment
            </Button>
          </CardContent>
        </Card>

        {/* Flexible Section (Remaining 20% Total) */}
        <Card className="border-l-4 border-green-500">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-green-700">
              Flexible Section (Remaining 20% Total)
              <span className="ml-2 text-sm font-normal text-gray-500">
                Current: {calculateTotal(flexibleAssessments)}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {flexibleAssessments.map(assessment => renderAssessmentCard(assessment, "flexible"))}
            </div>
            <Button
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => addAssessment("flexible")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Flexible Assessment
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Total Theory Component:</strong> {calculateTotal(sessionalAssessments) + calculateTotal(flexibleAssessments)}% / 40%
        </p>
        <p className="text-sm text-blue-800 mt-1">
          <strong>Remaining for Terminal (Final Exam):</strong> {60 - (calculateTotal(sessionalAssessments) + calculateTotal(flexibleAssessments))}% / 60%
        </p>
      </div>

      <Button onClick={saveRoadmap} className="bg-indigo-600 hover:bg-indigo-700">
        <Save className="h-4 w-4 mr-2" />
        Save Full Roadmap (40%)
      </Button>
    </div>
  )
}

