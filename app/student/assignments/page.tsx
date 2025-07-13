"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, BookOpen } from "lucide-react"

export default function StudentAssignments() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (user?.semester) {
      fetchAssignments()
    }
  }, [user])

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/assignments?semester=${user?.semester}`)
      const data = await response.json()

      if (data.success) {
        setAssignments(data.assignments)
      }
    } catch (error) {
      console.error("Error fetching assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch("/api/assignments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          rollNo: user?.rollNo,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: "Success", description: "Assignment submitted successfully" })
        fetchAssignments() // Refresh the list
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
  }

  const isSubmitted = (assignment: any) => {
    return assignment.submissions?.some((sub: any) => sub.rollNo === user?.rollNo && sub.status === "submit")
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-96">Loading assignments...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600 mt-2">View and submit your assignments</p>
      </div>

      <div className="grid gap-6">
        {assignments.length > 0 ? (
          assignments.map((assignment: any) => {
            const submitted = isSubmitted(assignment)
            const overdue = isOverdue(assignment.dueDate)

            return (
              <Card key={assignment._id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {assignment.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {assignment.course} • {assignment.marks} marks
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {submitted ? (
                        <Badge variant="default">Submitted</Badge>
                      ) : overdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">{assignment.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(assignment.dueDate).toLocaleTimeString()}
                      </div>
                    </div>

                    {!submitted && !overdue && (
                      <Button onClick={() => handleSubmitAssignment(assignment._id)} className="w-full sm:w-auto">
                        Submit Assignment
                      </Button>
                    )}

                    {submitted && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-800 text-sm">✓ Assignment submitted successfully</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
              <p className="text-gray-600">Assignments for your semester will appear here when they're created.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
