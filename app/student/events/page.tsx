"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { apiFetch } from "@/lib/api-client"

export default function StudentEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await apiFetch("/api/events")
      const data = await response.json()

      if (data.success) {
        setEvents(data.events)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      case "Low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Academic":
        return "default"
      case "Cultural":
        return "secondary"
      case "Sports":
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-96">Loading events...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">University Events</h1>
        <p className="text-gray-600 mt-2">Stay updated with upcoming events and activities</p>
      </div>

      <div className="grid gap-6">
        {events.length > 0 ? (
          events.map((event: any) => (
            <Card key={event._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {event.eventName}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {event.description || "Join us for this exciting event!"}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant={getPriorityColor(event.priority)}>{event.priority} Priority</Badge>
                    <Badge variant={getTypeColor(event.type)}>{event.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{new Date(event.time).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(event.time).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-gray-500">{event.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Attendees</div>
                        <div className="text-gray-500">{event.attendees}</div>
                      </div>
                    </div>
                  </div>

                  {new Date(event.time) <= new Date() && (
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">This event has already occurred.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
              <p className="text-gray-600">University events and announcements will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
