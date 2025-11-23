"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Video } from "lucide-react"
import { apiFetch } from "@/lib/api-client"

export default function UploadNotes() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    semester: "",
    course: "",
    noteType: "",
    youtubeUrl: "",
  })
  const [courses, setCourses] = useState([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await apiFetch("/api/courses")
      const data = await response.json()
      if (data.success) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast({ title: "Error", description: "Failed to fetch courses", variant: "destructive" })
    }
  }

  const extractYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast({ title: "Error", description: "Please select a PDF file", variant: "destructive" })
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({ title: "Error", description: "File size must be less than 10MB", variant: "destructive" })
        return
      }
      setSelectedFile(file)
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    // In a real application, you would upload to a cloud storage service
    // For demo purposes, we'll simulate file upload and return a placeholder URL
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`/uploads/notes/${file.name}`)
      }, 1000)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let fileUrl = ""
      let fileName = ""
      let videoId: string | undefined

      if (formData.noteType === "pdf") {
        if (!selectedFile) {
          toast({ title: "Error", description: "Please select a PDF file", variant: "destructive" })
          setLoading(false)
          return
        }

        // Upload file and get URL
        fileUrl = await uploadFile(selectedFile)
        fileName = selectedFile.name
      } else if (formData.noteType === "youtube") {
        if (!formData.youtubeUrl) {
          toast({ title: "Error", description: "Please enter a YouTube URL", variant: "destructive" })
          setLoading(false)
          return
        }

        const extractedVideoId = extractYouTubeVideoId(formData.youtubeUrl)
        if (!extractedVideoId) {
          toast({ title: "Error", description: "Invalid YouTube URL", variant: "destructive" })
          setLoading(false)
          return
        }
        videoId = extractedVideoId
        fileUrl = formData.youtubeUrl
        fileName = formData.title
      }

      const response = await apiFetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          semester: Number.parseInt(formData.semester),
          course: formData.course,
          fileUrl,
          fileName,
          videoId: videoId || "",
          noteType: formData.noteType,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: "Success", description: "Notes uploaded successfully" })
        setFormData({
          title: "",
          description: "",
          semester: "",
          course: "",
          noteType: "",
          youtubeUrl: "",
        })
        setSelectedFile(null)
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Notes</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Upload Study Materials</CardTitle>
          <CardDescription>Add notes and study materials for students</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Chapter 1 - Introduction to Data Structures"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the notes content..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, course: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course: any) => (
                      <SelectItem key={course._id} value={course.name}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="noteType">Note Type</Label>
              <Select
                value={formData.noteType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, noteType: value, youtubeUrl: "" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF Document
                    </div>
                  </SelectItem>
                  <SelectItem value="youtube">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      YouTube Video Lecture
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.noteType === "pdf" && (
              <div className="space-y-2">
                <Label htmlFor="pdfFile">PDF File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input id="pdfFile" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  <label htmlFor="pdfFile" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedFile ? selectedFile.name : "Click to upload PDF file"}
                    </p>
                    <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
                  </label>
                </div>
              </div>
            )}

            {formData.noteType === "youtube" && (
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube Video URL</Label>
                <Input
                  id="youtubeUrl"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                  required
                />
                <p className="text-sm text-gray-500">Paste the full YouTube video URL</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !formData.noteType}>
              {loading ? "Uploading Notes..." : "Upload Notes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
