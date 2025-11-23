"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { FileText, Download, Play, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api-client"

export default function StudentNotes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await apiFetch(`/api/notes?semester=${user?.semester}`)
      const data = await response.json()

      if (data.success) {
        setNotes(data.notes)
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be")
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-96">Loading notes...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Study Notes</h1>
        <p className="text-gray-600 mt-2">Access your course materials and notes</p>
      </div>

      <div className="grid gap-6">
        {notes.length > 0 ? (
          notes.map((note: any) => (
            <Card key={note._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {isYouTubeUrl(note.fileUrl || "") ? (
                        <Play className="h-5 w-5 text-red-500" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                      {note.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {note.course} • Semester {note.semester}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{isYouTubeUrl(note.fileUrl || "") ? "Video" : "PDF"}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">{note.description}</p>

                  {isYouTubeUrl(note.fileUrl || "") ? (
                    // YouTube Video
                    <div className="space-y-3">
                      {getYouTubeVideoId(note.fileUrl) && (
                        <div className="relative">
                          <img
                            src={`https://img.youtube.com/vi/${getYouTubeVideoId(note.fileUrl)}/maxresdefault.jpg`}
                            alt="Video thumbnail"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-red-600 rounded-full p-3">
                              <Play className="h-8 w-8 text-white fill-current" />
                            </div>
                          </div>
                        </div>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.open(note.fileUrl, "_blank")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Watch Lecture
                      </Button>
                    </div>
                  ) : (
                    // PDF Document
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Uploaded: {new Date(note.createdAt).toLocaleDateString()}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(note.fileUrl, "_blank")}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes available</h3>
              <p className="text-gray-600">Study materials for your semester will appear here when uploaded.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
