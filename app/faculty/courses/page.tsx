"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lock, LockOpen, BookOpen, FileText } from "lucide-react"
import Link from "next/link"

const mockCourses = [
  { 
    id: 1, 
    code: "SE 305", 
    name: "Software Engineering", 
    credits: 3,
    creditBreakdown: "3 Theory, 0 Lab",
    students: 45, 
    semester: "Fall 2024",
    isLocked: false
  },
  { 
    id: 2, 
    code: "CS 401", 
    name: "Advanced Algorithms", 
    credits: 4,
    creditBreakdown: "3 Theory, 1 Lab",
    students: 38, 
    semester: "Fall 2024",
    isLocked: true
  },
]

export default function MyCourses() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Assigned Courses Management</h1>
        <p className="text-gray-600 mt-1">All courses assigned to you, organized by semester.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-indigo-700">Fall 2024 Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockCourses.map((course) => (
              <div
                key={course.id}
                className={`p-4 rounded-lg border shadow-sm transition hover:shadow-lg ${
                  course.isLocked ? "bg-gray-50" : "border-gray-200"
                }`}
              >
                <p className="text-lg font-bold text-gray-900">{course.code} - {course.name}</p>
                <p className="text-sm text-gray-500">{course.credits} Credit Hours ({course.creditBreakdown})</p>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center">
                    {course.isLocked ? (
                      <span className="inline-flex items-center text-sm font-medium text-red-600">
                        <Lock className="h-4 w-4 mr-1" />
                        Evaluation Status: Locked (Submitted)
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-sm font-medium text-green-600">
                        <LockOpen className="h-4 w-4 mr-1" />
                        Evaluation Status: Open
                      </span>
                    )}
                  </div>
                  
                  {!course.isLocked ? (
                    <>
                      <Link href="/faculty/assessments/roadmap">
                        <Button variant="link" className="p-0 h-auto text-indigo-600 hover:text-indigo-800">
                          Access Assessment Roadmap →
                        </Button>
                      </Link>
                      <Link href="/faculty/assessments/terminal-mapping">
                        <Button variant="link" className="p-0 h-auto text-indigo-600 hover:text-indigo-800">
                          View Final Exam Mapping →
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-400 cursor-not-allowed">
                        Roadmap Access Denied
                      </p>
                      <Link href="/faculty/reports/clo-attainment">
                        <Button variant="link" className="p-0 h-auto text-indigo-600 hover:text-indigo-800">
                          View Final Report →
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}