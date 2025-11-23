"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, FileText, Edit, Trash2, Download, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api-client"

export default function ViewNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [editingNote, setEditingNote] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    course: "",
    semester: "",
    noteType: "",
    fileUrl: "",
    youtubeUrl: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await apiFetch("/api/notes")
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

  const handleEdit = (note: any) => {
    setEditingNote(note)
    setEditFormData({
      title: note.title,
      description: note.description,
      course: note.course,
      semester: note.semester.toString(),
      noteType: note.videoId ? "youtube" : "pdf",
      fileUrl: note.videoId ? "" : note.fileUrl,
      youtubeUrl: note.videoId ? note.fileUrl : "",
    })
  }

  const handleUpdate = async () => {
    try {
      const finalData = {
        title: editFormData.title,
        description: editFormData.description,
        course: editFormData.course,
        semester: Number.parseInt(editFormData.semester),
        fileUrl: "",
        videoId: "",
      }

      if (editFormData.noteType === "pdf") {
        finalData.fileUrl = editFormData.fileUrl
        finalData.videoId = ""
      } else if (editFormData.noteType === "youtube") {
        const videoId = extractYouTubeVideoId(editFormData.youtubeUrl)
        if (!videoId) {
          toast({ title: "Error", description: "Invalid YouTube URL", variant: "destructive" })
          return
        }
        finalData.videoId = videoId
        finalData.fileUrl = editFormData.youtubeUrl
      }

      const response = await apiFetch(`/api/notes/${editingNote._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: "Success", description: "Note updated successfully" })
        setEditingNote(null)
        fetchNotes()
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
  }

  const handleDelete = async (noteId: string) => {
    try {
      const response = await apiFetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: "Success", description: "Note deleted successfully" })
        setDeleteConfirm(null)
        fetchNotes()
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
  }

  const extractYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const filteredNotes = notes.filter((note: any) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = semesterFilter === "all" || note.semester.toString() === semesterFilter
    return matchesSearch && matchesSemester
  })

  const getTypeColor = (note: any) => {
    return note.videoId ? "secondary" : "default"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Notes</h1>
          <p className="text-gray-600 mt-2">View and manage all uploaded notes</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          <span>{notes.length} Total Notes</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by title or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notes Database</CardTitle>
          <CardDescription>Complete list of all study materials and notes</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes.map((note: any) => (
                    <TableRow key={note._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium max-w-xs">
                        <div>
                          <div className="font-semibold">{note.title}</div>
                          <div className="text-sm text-gray-500 truncate">{note.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{note.course}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Sem {note.semester}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeColor(note)}>{note.videoId ? "Video" : "PDF"}</Badge>
                      </TableCell>
                      <TableCell>
                        {note.videoId ? (
                          <Button variant="outline" size="sm" onClick={() => window.open(note.fileUrl, "_blank")}>
                            <Play className="h-4 w-4 mr-1" />
                            Watch
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => window.open(note.fileUrl, "_blank")}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500">{new Date(note.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(note)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(note)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || semesterFilter !== "all" ? "No notes found" : "No notes uploaded yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || semesterFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Notes will appear here when uploaded"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Make changes to the note details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-course">Course</Label>
                <Input
                  id="edit-course"
                  value={editFormData.course}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, course: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-semester">Semester</Label>
                <Select
                  value={editFormData.semester}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, semester: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-noteType">Note Type</Label>
              <Select
                value={editFormData.noteType}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, noteType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="youtube">YouTube Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editFormData.noteType === "pdf" && (
              <div className="space-y-2">
                <Label htmlFor="edit-fileUrl">PDF URL</Label>
                <Input
                  id="edit-fileUrl"
                  value={editFormData.fileUrl}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, fileUrl: e.target.value }))}
                />
              </div>
            )}
            {editFormData.noteType === "youtube" && (
              <div className="space-y-2">
                <Label htmlFor="edit-youtubeUrl">YouTube URL</Label>
                <Input
                  id="edit-youtubeUrl"
                  value={editFormData.youtubeUrl}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm._id)}>
              Delete Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
