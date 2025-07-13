"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, FileText, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ViewMarks() {
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [editingMark, setEditingMark] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    rollNo: "",
    course: "",
    examType: "",
    semester: "",
    theoryObtained: "",
    theoryTotal: "",
    labObtained: "",
    labTotal: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchMarks()
  }, [])

  const fetchMarks = async () => {
    try {
      const response = await fetch("/api/marks")
      const data = await response.json()
      if (data.success) {
        setMarks(data.marks)
      }
    } catch (error) {
      console.error("Error fetching marks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (mark: any) => {
    setEditingMark(mark)
    setEditFormData({
      rollNo: mark.rollNo,
      course: mark.course,
      examType: mark.examType,
      semester: mark.semester.toString(),
      theoryObtained: mark.theoryObtained.toString(),
      theoryTotal: mark.theoryTotal.toString(),
      labObtained: mark.labObtained.toString(),
      labTotal: mark.labTotal.toString(),
    })
  }

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/marks/${editingMark._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          semester: Number.parseInt(editFormData.semester),
          theoryObtained: Number.parseInt(editFormData.theoryObtained),
          theoryTotal: Number.parseInt(editFormData.theoryTotal),
          labObtained: Number.parseInt(editFormData.labObtained),
          labTotal: Number.parseInt(editFormData.labTotal),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: "Success", description: "Marks updated successfully" })
        setEditingMark(null)
        fetchMarks()
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
  }

  const handleDelete = async (markId: string) => {
    try {
      const response = await fetch(`/api/marks/${markId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: "Success", description: "Marks deleted successfully" })
        setDeleteConfirm(null)
        fetchMarks()
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
  }

  const filteredMarks = marks.filter((mark: any) => {
    const matchesSearch =
      mark.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = semesterFilter === "all" || mark.semester.toString() === semesterFilter
    return matchesSearch && matchesSemester
  })

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return "default"
    if (percentage >= 70) return "secondary"
    if (percentage >= 60) return "outline"
    return "destructive"
  }

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case "Final":
        return "default"
      case "Mid":
        return "secondary"
      case "Quiz":
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Student Marks</h1>
          <p className="text-gray-600 mt-2">View and manage all uploaded marks</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          <span>{marks.length} Total Records</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by roll number or course..."
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

      {/* Marks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Marks Database</CardTitle>
          <CardDescription>Complete record of all student marks and grades</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMarks.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Theory</TableHead>
                    <TableHead>Lab</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMarks.map((mark: any) => {
                    const percentage = Math.round((mark.obtainedMarks / mark.totalMarks) * 100)
                    return (
                      <TableRow key={mark._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{mark.rollNo}</TableCell>
                        <TableCell>{mark.course}</TableCell>
                        <TableCell>
                          <Badge variant={getExamTypeColor(mark.examType)}>{mark.examType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Sem {mark.semester}</Badge>
                        </TableCell>
                        <TableCell>
                          {mark.theoryTotal > 0 ? `${mark.theoryObtained}/${mark.theoryTotal}` : "-"}
                        </TableCell>
                        <TableCell>{mark.labTotal > 0 ? `${mark.labObtained}/${mark.labTotal}` : "-"}</TableCell>
                        <TableCell className="font-medium">
                          {mark.obtainedMarks}/{mark.totalMarks}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getGradeColor(percentage)}>{percentage}%</Badge>
                        </TableCell>
                        <TableCell className="text-gray-500">{new Date(mark.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(mark)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(mark)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || semesterFilter !== "all" ? "No marks found" : "No marks uploaded yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || semesterFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Student marks will appear here when uploaded"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingMark} onOpenChange={() => setEditingMark(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Marks</DialogTitle>
            <DialogDescription>Make changes to the student marks.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rollNo">Roll Number</Label>
                <Input
                  id="edit-rollNo"
                  value={editFormData.rollNo}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, rollNo: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-course">Course</Label>
                <Input
                  id="edit-course"
                  value={editFormData.course}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, course: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-examType">Exam Type</Label>
                <Select
                  value={editFormData.examType}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, examType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Mid">Mid Term</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-theoryObtained">Theory Obtained</Label>
                <Input
                  id="edit-theoryObtained"
                  type="number"
                  value={editFormData.theoryObtained}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, theoryObtained: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-theoryTotal">Theory Total</Label>
                <Input
                  id="edit-theoryTotal"
                  type="number"
                  value={editFormData.theoryTotal}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, theoryTotal: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-labObtained">Lab Obtained</Label>
                <Input
                  id="edit-labObtained"
                  type="number"
                  value={editFormData.labObtained}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, labObtained: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-labTotal">Lab Total</Label>
                <Input
                  id="edit-labTotal"
                  type="number"
                  value={editFormData.labTotal}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, labTotal: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMark(null)}>
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
            <DialogTitle>Delete Marks</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete marks for {deleteConfirm?.rollNo} in {deleteConfirm?.course}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm._id)}>
              Delete Marks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
