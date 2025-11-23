"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2, Calendar, Clock, User, Search, Filter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiFetch } from "@/lib/api-client"

export default function ViewTimetable() {
  const [timetable, setTimetable] = useState([])
  const [filteredTimetable, setFilteredTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [deleteDialog, setDeleteDialog] = useState({ open: false, entryId: "", course: "" })
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTimetable()
  }, [])

  useEffect(() => {
    let filtered = timetable

    if (searchTerm) {
      filtered = filtered.filter(
        (entry: any) =>
          entry.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.room?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.day?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (semesterFilter !== "all") {
      filtered = filtered.filter((entry: any) => entry.semester?.toString() === semesterFilter)
    }

    setFilteredTimetable(filtered)
  }, [searchTerm, semesterFilter, timetable])

  const fetchTimetable = async () => {
    try {
      const response = await apiFetch("/api/timetable")
      const data = await response.json()
      if (data.success && Array.isArray(data.timetable)) {
        setTimetable(data.timetable)
        setFilteredTimetable(data.timetable)
      } else {
        setTimetable([])
        setFilteredTimetable([])
      }
    } catch (error) {
      console.error("Error fetching timetable:", error)
      toast({ title: "Error", description: "Failed to fetch timetable data", variant: "destructive" })
      setTimetable([])
      setFilteredTimetable([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (entryId: string, course: string) => {
    setDeleteDialog({ open: true, entryId, course })
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      const response = await apiFetch(`/api/timetable/${deleteDialog.entryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({ title: "Success", description: "Timetable entry deleted successfully" })
        fetchTimetable() // Refresh the list
      } else {
        toast({ title: "Error", description: "Failed to delete timetable entry", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setDeleting(false)
      setDeleteDialog({ open: false, entryId: "", course: "" })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, entryId: "", course: "" })
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Invalid Date"
    }
  }

  const getClassTypeColor = (classType: string) => {
    switch (classType?.toLowerCase()) {
      case "lecture":
        return "bg-blue-100 text-blue-800"
      case "lab":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timetable...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Timetable</h1>
        <Badge variant="secondary" className="text-sm">
          Total: {filteredTimetable.length}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Class Schedule
          </CardTitle>
          <CardDescription>View and manage class timetable</CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses, instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Semesters" />
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
          </div>
        </CardHeader>
        <CardContent>
          {filteredTimetable.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                {searchTerm || semesterFilter !== "all"
                  ? "No timetable entries found matching your criteria"
                  : "No timetable entries found"}
              </p>
              <p className="text-sm text-gray-500">
                {searchTerm || semesterFilter !== "all"
                  ? "Try adjusting your search or filter"
                  : "Add timetable entries to see them here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTimetable.map((entry: any) => (
                    <TableRow key={entry._id}>
                      <TableCell className="font-medium">{entry.course || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Semester {entry.semester || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>{entry.day || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(entry.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{entry.time || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getClassTypeColor(entry.classType)}>{entry.classType || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{entry.instructor || "TBA"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{entry.room || "TBA"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(entry._id, entry.course || "Unknown Course")}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={handleDeleteCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timetable Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the timetable entry for <strong>{deleteDialog.course}</strong>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
