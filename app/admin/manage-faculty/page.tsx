"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, UserCheck, Search, BookOpen, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Faculty {
  _id: string
  facultyId: string
  name: string
  email: string
  department: string
  designation: string
  username?: string
  isAdmin?: boolean
}

interface Course {
  _id: string
  courseCode: string
  courseName: string
  credits: number
  semester: number
}

interface CourseAssignment {
  _id: string
  facultyId: {
    _id: string
    name: string
    facultyId: string
  }
  courseId: {
    _id: string
    courseCode: string
    courseName: string
  }
  semester: number
  status: string
}

export default function ManageFaculty() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<CourseAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [formData, setFormData] = useState({
    facultyId: "",
    name: "",
    email: "",
    department: "",
    designation: "",
    username: "",
    password: "",
  })
  const [assignFormData, setAssignFormData] = useState({
    facultyId: "",
    courseId: "",
    semester: 1,
    batchId: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchFaculty()
    fetchCourses()
    fetchAssignments()
  }, [])

  const fetchFaculty = async () => {
    try {
      const response = await fetch("/api/faculty")
      const data = await response.json()
      if (data.success) {
        setFaculty(data.faculty)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch faculty",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      const data = await response.json()
      if (data.success) {
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    }
  }

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/faculty-course")
      const data = await response.json()
      if (data.success) {
        setAssignments(data.assignments || [])
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error)
    }
  }

  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/faculty-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignFormData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Course assigned successfully",
        })
        setIsAssignDialogOpen(false)
        setAssignFormData({
          facultyId: "",
          courseId: "",
          semester: 1,
          batchId: "",
        })
        fetchAssignments()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to assign course",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/faculty-course?id=${assignmentId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Course assignment removed successfully",
        })
        fetchAssignments()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to remove assignment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = selectedFaculty ? "/api/faculty" : "/api/faculty"
      const method = selectedFaculty ? "PUT" : "POST"
      const body = selectedFaculty
        ? { id: selectedFaculty._id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: selectedFaculty
            ? "Faculty updated successfully"
            : "Faculty added successfully",
        })
        setIsDialogOpen(false)
        resetForm()
        fetchFaculty()
      } else {
        toast({
          title: "Error",
          description: data.message || "Operation failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedFaculty) return

    try {
      const response = await fetch(`/api/faculty?id=${selectedFaculty._id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Faculty deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        setSelectedFaculty(null)
        fetchFaculty()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete faculty",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      facultyId: "",
      name: "",
      email: "",
      department: "",
      designation: "",
      username: "",
      password: "",
    })
    setSelectedFaculty(null)
  }

  const handleEdit = (facultyMember: Faculty) => {
    setSelectedFaculty(facultyMember)
    setFormData({
      facultyId: facultyMember.facultyId,
      name: facultyMember.name,
      email: facultyMember.email,
      department: facultyMember.department,
      designation: facultyMember.designation,
      username: facultyMember.username || "",
      password: "",
    })
    setIsDialogOpen(true)
  }

  const filteredFaculty = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.facultyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Manage Faculty</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Faculty</h1>
          <p className="text-gray-600 mt-1">C1 - CRUD operations for faculty management and course assignment</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedFaculty ? "Edit Faculty" : "Add New Faculty"}
              </DialogTitle>
              <DialogDescription>
                {selectedFaculty
                  ? "Update faculty information"
                  : "Add a new faculty member to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facultyId">Faculty ID *</Label>
                    <Input
                      id="facultyId"
                      value={formData.facultyId}
                      onChange={(e) =>
                        setFormData({ ...formData, facultyId: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation *</Label>
                    <Select
                      value={formData.designation}
                      onValueChange={(value) =>
                        setFormData({ ...formData, designation: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Associate Professor">
                          Associate Professor
                        </SelectItem>
                        <SelectItem value="Assistant Professor">
                          Assistant Professor
                        </SelectItem>
                        <SelectItem value="Lecturer">Lecturer</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                  </div>
                </div>
                {!selectedFaculty && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedFaculty ? "Update" : "Add"} Faculty
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="faculty" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faculty">Faculty Management</TabsTrigger>
          <TabsTrigger value="assignments">Course Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="faculty" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Faculty List</CardTitle>
                  <CardDescription>
                    Manage all faculty members in the system
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search faculty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faculty ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFaculty.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No faculty members found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFaculty.map((facultyMember) => (
                          <TableRow key={facultyMember._id}>
                            <TableCell className="font-medium">
                              {facultyMember.facultyId}
                            </TableCell>
                            <TableCell>{facultyMember.name}</TableCell>
                            <TableCell>{facultyMember.email}</TableCell>
                            <TableCell>{facultyMember.department}</TableCell>
                            <TableCell>{facultyMember.designation}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(facultyMember)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedFaculty(facultyMember)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Course Assignments</h2>
              <p className="text-gray-600 mt-1">Assign courses to faculty members</p>
            </div>
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Course to Faculty</DialogTitle>
                  <DialogDescription>
                    Select a faculty member and course to assign
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAssignCourse}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignFacultyId">Faculty *</Label>
                      <Select
                        value={assignFormData.facultyId}
                        onValueChange={(value) =>
                          setAssignFormData({ ...assignFormData, facultyId: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select faculty" />
                        </SelectTrigger>
                        <SelectContent>
                          {faculty.map((f) => (
                            <SelectItem key={f._id} value={f._id}>
                              {f.name} ({f.facultyId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignCourseId">Course *</Label>
                      <Select
                        value={assignFormData.courseId}
                        onValueChange={(value) =>
                          setAssignFormData({ ...assignFormData, courseId: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                              {c.courseCode} - {c.courseName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignSemester">Semester *</Label>
                      <Input
                        id="assignSemester"
                        type="number"
                        min="1"
                        max="8"
                        value={assignFormData.semester}
                        onChange={(e) =>
                          setAssignFormData({
                            ...assignFormData,
                            semester: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAssignDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Assign Course</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Assignments</CardTitle>
              <CardDescription>
                View and manage course assignments to faculty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No course assignments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((assignment) => (
                        <TableRow key={assignment._id}>
                          <TableCell>
                            {assignment.facultyId?.name} ({assignment.facultyId?.facultyId})
                          </TableCell>
                          <TableCell>
                            {assignment.courseId?.courseCode} - {assignment.courseId?.courseName}
                          </TableCell>
                          <TableCell>{assignment.semester}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                assignment.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {assignment.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAssignment(assignment._id)}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              faculty member "{selectedFaculty?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

