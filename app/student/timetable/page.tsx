"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { Clock, User } from "lucide-react"

export default function StudentTimetable() {
  const { user } = useAuth()
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.semester) {
      fetchTimetable()
    }
  }, [user])

  const fetchTimetable = async () => {
    try {
      const response = await fetch(`/api/timetable?semester=${user?.semester}`)
      const data = await response.json()

      if (data.success) {
        setTimetable(data.timetable)
      }
    } catch (error) {
      console.error("Error fetching timetable:", error)
    } finally {
      setLoading(false)
    }
  }

  const groupByDay = (schedule: any[]) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const grouped: { [key: string]: any[] } = {}

    days.forEach((day) => {
      grouped[day] = schedule.filter((item) => item.day === day).sort((a, b) => a.time.localeCompare(b.time))
    })

    return grouped
  }

  const groupedTimetable = groupByDay(timetable)

  if (loading) {
    return <div className="flex items-center justify-center min-h-96">Loading timetable...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Class Timetable</h1>
        <p className="text-gray-600 mt-2">Your weekly class schedule for Semester {user?.semester}</p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTimetable).map(([day, classes]) => (
          <Card key={day}>
            <CardHeader>
              <CardTitle className="text-xl">{day}</CardTitle>
              <CardDescription>
                {classes.length} {classes.length === 1 ? "class" : "classes"} scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classes.length > 0 ? (
                <div className="space-y-4">
                  {classes.map((classItem: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{classItem.courseName}</h4>
                          <Badge variant={classItem.classType === "Lab" ? "secondary" : "default"}>
                            {classItem.classType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {classItem.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {classItem.instructor}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{classItem.courseCode}</div>
                        <div className="text-sm text-gray-500">{new Date(classItem.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No classes scheduled for {day}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {timetable.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No timetable available</h3>
            <p className="text-gray-600">Your class schedule will appear here when uploaded by admin.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
