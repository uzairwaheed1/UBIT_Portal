"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Question {
  id: string
  questionNumber: number
  maxMarks: number
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

export default function TerminalMapping() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      questionNumber: 1,
      maxMarks: 15,
      clo: CLOs[2],
      bloomLevel: BloomLevels[2]
    }
  ])

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      questionNumber: questions.length + 1,
      maxMarks: 10,
      clo: CLOs[0],
      bloomLevel: BloomLevels[0]
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    const filtered = questions.filter(q => q.id !== id)
    // Renumber questions
    const renumbered = filtered.map((q, index) => ({
      ...q,
      questionNumber: index + 1
    }))
    setQuestions(renumbered)
  }

  const updateQuestion = (id: string, field: keyof Question, value: string | number) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => sum + q.maxMarks, 0)
  }

  const saveTerminalMapping = () => {
    if (questions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one question to the final exam.",
        variant: "destructive"
      })
      return
    }

    const totalMarks = calculateTotalMarks()
    if (totalMarks === 0) {
      toast({
        title: "Validation Error",
        description: "Total marks cannot be zero.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success",
      description: `Final Exam Question Mapping (60% Terminal) saved successfully. Total Marks: ${totalMarks}`
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Terminal Section: 60% Final Exam Mapping</h1>
        <p className="text-gray-600 mt-1">
          Map each final exam question to its CLO, Bloom's Level, and Maximum Marks. This drives final CLO attainment calculation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Final Exam Questions</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Total Marks: <strong>{calculateTotalMarks()}</strong>
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question #</TableHead>
                  <TableHead>Max Marks</TableHead>
                  <TableHead>Linked CLO</TableHead>
                  <TableHead>Bloom's Level</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No questions added. Click "Add Question" to start mapping.
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{question.questionNumber}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={question.maxMarks}
                          onChange={(e) => updateQuestion(question.id, "maxMarks", parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={question.clo}
                          onValueChange={(value) => updateQuestion(question.id, "clo", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CLOs.map(clo => (
                              <SelectItem key={clo} value={clo}>{clo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={question.bloomLevel}
                          onValueChange={(value) => updateQuestion(question.id, "bloomLevel", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BloomLevels.map(bloom => (
                              <SelectItem key={bloom} value={bloom}>{bloom}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Button
            variant="outline"
            className="mt-4 border-green-600 text-green-600 hover:bg-green-50"
            onClick={addQuestion}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </CardContent>
      </Card>

      <Button onClick={saveTerminalMapping} className="bg-indigo-600 hover:bg-indigo-700">
        <Save className="h-4 w-4 mr-2" />
        Save Terminal Mapping (60%)
      </Button>
    </div>
  )
}

