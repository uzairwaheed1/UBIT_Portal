"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Search, Plus, Edit, Trash2, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  type Program,
  type CreateProgramDto,
  type UpdateProgramDto,
} from "@/lib/program-service"

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Program | null>(null)
  const [formData, setFormData] = useState<CreateProgramDto>({
    code: "",
    name: "",
    department: "",
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateProgramDto, string>>>({})
  const { toast } = useToast()
  const { user } = useAuth()
  const isSuperAdmin = user?.role === "SuperAdmin"

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const data = await getAllPrograms()
      setPrograms(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch programs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateProgramDto, string>> = {}

    if (!formData.code.trim()) {
      errors.code = "Code is required"
    } else if (formData.code.length > 20) {
      errors.code = "Code must be 20 characters or less"
    }

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    } else if (formData.name.length > 255) {
      errors.name = "Name must be 255 characters or less"
    }

    if (!formData.department.trim()) {
      errors.department = "Department is required"
    } else if (formData.department.length > 255) {
      errors.department = "Department must be 255 characters or less"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      department: "",
    })
    setFormErrors({})
  }

  const handleAdd = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const handleEdit = (program: Program) => {
    setFormData({
      code: program.code,
      name: program.name,
      department: program.department,
    })
    setFormErrors({})
    setEditingProgram(program)
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      if (editingProgram) {
        const updateData: UpdateProgramDto = {}
        if (formData.code !== editingProgram.code) updateData.code = formData.code
        if (formData.name !== editingProgram.name) updateData.name = formData.name
        if (formData.department !== editingProgram.department) updateData.department = formData.department

        await updateProgram(editingProgram.id, updateData)
        toast({
          title: "Success",
          description: "Program updated successfully",
        })
        setEditingProgram(null)
      } else {
        await createProgram(formData)
        toast({
          title: "Success",
          description: "Program created successfully",
        })
        setIsAddModalOpen(false)
      }
      resetForm()
      fetchPrograms()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save program",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (programId: number) => {
    try {
      await deleteProgram(programId)
      toast({
        title: "Success",
        description: "Program deleted successfully",
      })
      setDeleteConfirm(null)
      fetchPrograms()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete program",
        variant: "destructive",
      })
    }
  }

  const filteredPrograms = programs.filter(
    (program) =>
      program.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading programs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-600 mt-2">Manage academic programs</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="h-4 w-4" />
            <span>{programs.length} Total Programs</span>
          </div>
          {isSuperAdmin && (
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Program
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by code, name, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Programs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Program Database</CardTitle>
          <CardDescription>Complete list of all academic programs</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPrograms.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    {isSuperAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrograms.map((program) => (
                    <TableRow key={program.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{program.code}</TableCell>
                      <TableCell>{program.name}</TableCell>
                      <TableCell>{program.department}</TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(program)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(program)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No programs found" : "No programs yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : isSuperAdmin
                    ? "Click 'Add Program' to create your first program"
                    : "Programs will appear here when they are added to the system"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddModalOpen || !!editingProgram} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false)
          setEditingProgram(null)
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProgram ? "Edit Program" : "Add Program"}</DialogTitle>
            <DialogDescription>
              {editingProgram ? "Make changes to the program information." : "Create a new academic program."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, code: e.target.value }))
                  if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }))
                }}
                maxLength={20}
                placeholder="e.g., CS-2024"
              />
              {formErrors.code && <p className="text-sm text-red-500">{formErrors.code}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }))
                }}
                maxLength={255}
                placeholder="e.g., Computer Science"
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, department: e.target.value }))
                  if (formErrors.department) setFormErrors((prev) => ({ ...prev, department: undefined }))
                }}
                maxLength={255}
                placeholder="e.g., Computer Science Department"
              />
              {formErrors.department && <p className="text-sm text-red-500">{formErrors.department}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setEditingProgram(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingProgram ? "Save Changes" : "Create Program"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the program "{deleteConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

