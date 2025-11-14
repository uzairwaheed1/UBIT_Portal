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
import { Plus, Edit, Trash2, Calendar, Search, CheckCircle, XCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Batch {
  _id: string
  batchId: string
  batchName: string
  yearOfAdmission: number
  program: string
  status: "Active" | "Graduated" | "Inactive"
}

interface Semester {
  _id: string
  semesterId: string
  name: string
  startDate: string
  endDate: string
  status: "Active" | "Inactive"
}

export default function BatchSemesterManagement() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false)
  const [isSemesterDialogOpen, setIsSemesterDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [deleteType, setDeleteType] = useState<"batch" | "semester">("batch")
  const [batchFormData, setBatchFormData] = useState<{
    batchId: string
    batchName: string
    yearOfAdmission: number
    program: string
    status: "Active" | "Graduated" | "Inactive"
  }>({
    batchId: "",
    batchName: "",
    yearOfAdmission: new Date().getFullYear(),
    program: "BS Computer Science",
    status: "Active",
  })
  const [semesterFormData, setSemesterFormData] = useState<{
    semesterId: string
    name: string
    startDate: string
    endDate: string
    status: "Active" | "Inactive"
  }>({
    semesterId: "",
    name: "",
    startDate: "",
    endDate: "",
    status: "Active",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchBatches()
    fetchSemesters()
  }, [])

  const fetchBatches = async () => {
    try {
      const response = await fetch("/api/batch")
      const data = await response.json()
      if (data.success) {
        setBatches(data.batches || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch batches",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSemesters = async () => {
    try {
      const response = await fetch("/api/semester")
      const data = await response.json()
      if (data.success) {
        setSemesters(data.semesters || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch semesters",
        variant: "destructive",
      })
    }
  }

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = "/api/batch"
      const method = selectedBatch ? "PUT" : "POST"
      const body = selectedBatch
        ? { id: selectedBatch._id, ...batchFormData }
        : batchFormData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: selectedBatch
            ? "Batch updated successfully"
            : "Batch added successfully",
        })
        setIsBatchDialogOpen(false)
        resetBatchForm()
        fetchBatches()
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

  const handleSemesterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = "/api/semester"
      const method = selectedSemester ? "PUT" : "POST"
      const body = selectedSemester
        ? { id: selectedSemester._id, ...semesterFormData }
        : semesterFormData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: selectedSemester
            ? "Semester updated successfully"
            : "Semester added successfully",
        })
        setIsSemesterDialogOpen(false)
        resetSemesterForm()
        fetchSemesters()
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
    try {
      const url =
        deleteType === "batch"
          ? `/api/batch?id=${selectedBatch?._id}`
          : `/api/semester?id=${selectedSemester?._id}`
      const response = await fetch(url, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `${deleteType === "batch" ? "Batch" : "Semester"} deleted successfully`,
        })
        setIsDeleteDialogOpen(false)
        if (deleteType === "batch") {
          setSelectedBatch(null)
          fetchBatches()
        } else {
          setSelectedSemester(null)
          fetchSemesters()
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete",
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

  const toggleSemesterStatus = async (semester: Semester) => {
    try {
      const newStatus = semester.status === "Active" ? "Inactive" : "Active"
      const response = await fetch("/api/semester", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: semester._id,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Semester ${newStatus === "Active" ? "opened" : "closed"} successfully`,
        })
        fetchSemesters()
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

  const resetBatchForm = () => {
    setBatchFormData({
      batchId: "",
      batchName: "",
      yearOfAdmission: new Date().getFullYear(),
      program: "BS Computer Science",
      status: "Active" as "Active" | "Graduated" | "Inactive",
    })
    setSelectedBatch(null)
  }

  const resetSemesterForm = () => {
    setSemesterFormData({
      semesterId: "",
      name: "",
      startDate: "",
      endDate: "",
      status: "Active" as "Active" | "Inactive",
    })
    setSelectedSemester(null)
  }

  const handleEditBatch = (batch: Batch) => {
    setSelectedBatch(batch)
    setBatchFormData({
      batchId: batch.batchId,
      batchName: batch.batchName,
      yearOfAdmission: batch.yearOfAdmission,
      program: batch.program,
      status: batch.status as "Active" | "Graduated" | "Inactive",
    })
    setIsBatchDialogOpen(true)
  }

  const handleEditSemester = (semester: Semester) => {
    setSelectedSemester(semester)
    setSemesterFormData({
      semesterId: semester.semesterId,
      name: semester.name,
      startDate: semester.startDate.split("T")[0],
      endDate: semester.endDate.split("T")[0],
      status: semester.status as "Active" | "Inactive",
    })
    setIsSemesterDialogOpen(true)
  }

  const filteredBatches = batches.filter(
    (b) =>
      b.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.batchId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSemesters = semesters.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.semesterId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Batch & Semester Management</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Batch & Semester Management</h1>
        <p className="text-gray-600 mt-1">C2 - Manage batches and semester lifecycle</p>
      </div>

      <Tabs defaultValue="batches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="semesters">Semesters</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetBatchForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Batch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedBatch ? "Edit Batch" : "Add New Batch"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedBatch
                      ? "Update batch information"
                      : "Add a new batch to the system"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBatchSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="batchId">Batch ID *</Label>
                        <Input
                          id="batchId"
                          value={batchFormData.batchId}
                          onChange={(e) =>
                            setBatchFormData({
                              ...batchFormData,
                              batchId: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batchName">Batch Name *</Label>
                        <Input
                          id="batchName"
                          value={batchFormData.batchName}
                          onChange={(e) =>
                            setBatchFormData({
                              ...batchFormData,
                              batchName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearOfAdmission">Year of Admission *</Label>
                        <Input
                          id="yearOfAdmission"
                          type="number"
                          value={batchFormData.yearOfAdmission}
                          onChange={(e) =>
                            setBatchFormData({
                              ...batchFormData,
                              yearOfAdmission: parseInt(e.target.value),
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="program">Program *</Label>
                        <Input
                          id="program"
                          value={batchFormData.program}
                          onChange={(e) =>
                            setBatchFormData({
                              batchId: batchFormData.batchId,
                              batchName: batchFormData.batchName,
                              yearOfAdmission: batchFormData.yearOfAdmission,
                              program: e.target.value,
                              status: batchFormData.status,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={batchFormData.status}
                        onValueChange={(value) =>
                          setBatchFormData({ ...batchFormData, status: value as "Active" | "Graduated" | "Inactive" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Graduated">Graduated</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsBatchDialogOpen(false)
                        resetBatchForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {selectedBatch ? "Update" : "Add"} Batch
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Batch List</CardTitle>
              <CardDescription>Manage all batches in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Batch Name</TableHead>
                        <TableHead>Year of Admission</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBatches.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No batches found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBatches.map((batch) => (
                          <TableRow key={batch._id}>
                            <TableCell className="font-medium">
                              {batch.batchId}
                            </TableCell>
                            <TableCell>{batch.batchName}</TableCell>
                            <TableCell>{batch.yearOfAdmission}</TableCell>
                            <TableCell>{batch.program}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  batch.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : batch.status === "Graduated"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {batch.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditBatch(batch)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBatch(batch)
                                    setDeleteType("batch")
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

        <TabsContent value="semesters" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search semesters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isSemesterDialogOpen} onOpenChange={setIsSemesterDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetSemesterForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Semester
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedSemester ? "Edit Semester" : "Add New Semester"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedSemester
                      ? "Update semester information"
                      : "Add a new semester to the system"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSemesterSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="semesterId">Semester ID *</Label>
                        <Input
                          id="semesterId"
                          value={semesterFormData.semesterId}
                          onChange={(e) =>
                            setSemesterFormData({
                              ...semesterFormData,
                              semesterId: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Semester Name *</Label>
                        <Input
                          id="name"
                          value={semesterFormData.name}
                          onChange={(e) =>
                            setSemesterFormData({
                              ...semesterFormData,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={semesterFormData.startDate}
                          onChange={(e) =>
                            setSemesterFormData({
                              ...semesterFormData,
                              startDate: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={semesterFormData.endDate}
                          onChange={(e) =>
                            setSemesterFormData({
                              semesterId: semesterFormData.semesterId,
                              name: semesterFormData.name,
                              startDate: semesterFormData.startDate,
                              endDate: e.target.value,
                              status: semesterFormData.status,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={semesterFormData.status}
                        onValueChange={(value) =>
                          setSemesterFormData({
                            semesterId: semesterFormData.semesterId,
                            name: semesterFormData.name,
                            startDate: semesterFormData.startDate,
                            endDate: semesterFormData.endDate,
                            status: value as "Active" | "Inactive",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsSemesterDialogOpen(false)
                        resetSemesterForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {selectedSemester ? "Update" : "Add"} Semester
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Semester List</CardTitle>
              <CardDescription>
                Manage all semesters. Click the status button to open/close semesters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Semester ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSemesters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No semesters found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSemesters.map((semester) => (
                        <TableRow key={semester._id}>
                          <TableCell className="font-medium">
                            {semester.semesterId}
                          </TableCell>
                          <TableCell>{semester.name}</TableCell>
                          <TableCell>
                            {new Date(semester.startDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(semester.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSemesterStatus(semester)}
                              className={
                                semester.status === "Active"
                                  ? "text-green-600 border-green-600"
                                  : "text-gray-600"
                              }
                            >
                              {semester.status === "Active" ? (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              {semester.status}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSemester(semester)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSemester(semester)
                                  setDeleteType("semester")
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {deleteType === "batch" ? "batch" : "semester"}.
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

