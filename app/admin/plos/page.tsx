"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Search, Plus, Edit, Trash2, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  getAllPlos,
  createPlo,
  updatePlo,
  deletePlo,
  type PLO,
  type CreatePloDto,
  type UpdatePloDto,
} from "@/lib/plo-service"
import { getAllPrograms, type Program } from "@/lib/program-service"

export default function PlosPage() {
  const [plos, setPlos] = useState<PLO[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProgramId, setSelectedProgramId] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingPlo, setEditingPlo] = useState<PLO | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<PLO | null>(null)
  const [formData, setFormData] = useState<CreatePloDto>({
    code: "",
    title: "",
    description: "",
    program_id: 0,
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreatePloDto, string>>>({})
  const { toast } = useToast()
  const { user } = useAuth()
  const isSuperAdmin = user?.role === "SuperAdmin"

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [plosData, programsData] = await Promise.all([getAllPlos(), getAllPrograms()])
      setPlos(plosData)
      setPrograms(programsData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreatePloDto, string>> = {}

    if (!formData.code.trim()) {
      errors.code = "Code is required"
    } else if (formData.code.length > 50) {
      errors.code = "Code must be 50 characters or less"
    }

    if (!formData.title.trim()) {
      errors.title = "Title is required"
    } else if (formData.title.length > 255) {
      errors.title = "Title must be 255 characters or less"
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required"
    }

    if (!formData.program_id || formData.program_id === 0) {
      errors.program_id = "Program is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      program_id: 0,
    })
    setFormErrors({})
  }

  const handleAdd = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const handleEdit = (plo: PLO) => {
    setFormData({
      code: plo.code,
      title: plo.title,
      description: plo.description,
      program_id: plo.program_id,
    })
    setFormErrors({})
    setEditingPlo(plo)
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      if (editingPlo) {
        const updateData: UpdatePloDto = {}
        if (formData.code !== editingPlo.code) updateData.code = formData.code
        if (formData.title !== editingPlo.title) updateData.title = formData.title
        if (formData.description !== editingPlo.description) updateData.description = formData.description
        if (formData.program_id !== editingPlo.program_id) updateData.program_id = formData.program_id

        await updatePlo(editingPlo.id, updateData)
        toast({
          title: "Success",
          description: "PLO updated successfully",
        })
        setEditingPlo(null)
      } else {
        await createPlo(formData)
        toast({
          title: "Success",
          description: "PLO created successfully",
        })
        setIsAddModalOpen(false)
      }
      resetForm()
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save PLO",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (ploId: number) => {
    try {
      await deletePlo(ploId)
      toast({
        title: "Success",
        description: "PLO deleted successfully",
      })
      setDeleteConfirm(null)
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete PLO",
        variant: "destructive",
      })
    }
  }

  // Filter PLOs by selected program and search term
  const filteredPlos = plos.filter((plo) => {
    const matchesProgram = selectedProgramId === "all" || plo.program_id === Number.parseInt(selectedProgramId)
    const matchesSearch =
      plo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plo.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesProgram && matchesSearch
  })

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PLOs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Program Learning Outcomes (PLOs)</h1>
          <p className="text-gray-600 mt-2">Manage program learning outcomes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span>{filteredPlos.length} PLOs</span>
          </div>
          {isSuperAdmin && (
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add PLO
            </Button>
          )}
        </div>
      </div>

      {/* Program Filter and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program-filter">Filter by Program</Label>
              <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                <SelectTrigger id="program-filter">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by code, title, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PLOs Table */}
      <Card>
        <CardHeader>
          <CardTitle>PLO Database</CardTitle>
          <CardDescription>Complete list of all program learning outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPlos.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Program</TableHead>
                    {isSuperAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlos.map((plo) => {
                    const program = programs.find((p) => p.id === plo.program_id)
                    return (
                      <TableRow key={plo.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{plo.code}</TableCell>
                        <TableCell>{plo.title}</TableCell>
                        <TableCell className="max-w-md">
                          <p className="truncate" title={plo.description}>
                            {truncateDescription(plo.description)}
                          </p>
                        </TableCell>
                        <TableCell>{program?.name || `Program ${plo.program_id}`}</TableCell>
                        {isSuperAdmin && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(plo)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(plo)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
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
                {searchTerm || selectedProgramId !== "all" ? "No PLOs found" : "No PLOs yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedProgramId !== "all"
                  ? "Try adjusting your search or filter terms"
                  : isSuperAdmin
                    ? "Click 'Add PLO' to create your first PLO"
                    : "PLOs will appear here when they are added to the system"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddModalOpen || !!editingPlo} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false)
          setEditingPlo(null)
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPlo ? "Edit PLO" : "Add PLO"}</DialogTitle>
            <DialogDescription>
              {editingPlo ? "Make changes to the PLO information." : "Create a new program learning outcome."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plo-code">Code *</Label>
              <Input
                id="plo-code"
                value={formData.code}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, code: e.target.value }))
                  if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }))
                }}
                maxLength={50}
                placeholder="e.g., PLO1"
              />
              {formErrors.code && <p className="text-sm text-red-500">{formErrors.code}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="plo-title">Title *</Label>
              <Input
                id="plo-title"
                value={formData.title}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                  if (formErrors.title) setFormErrors((prev) => ({ ...prev, title: undefined }))
                }}
                maxLength={255}
                placeholder="e.g., Engineering Knowledge"
              />
              {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="plo-description">Description *</Label>
              <Textarea
                id="plo-description"
                value={formData.description}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                  if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: undefined }))
                }}
                placeholder="Enter the full description of the PLO..."
                rows={4}
              />
              {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="plo-program">Program *</Label>
              <Select
                value={formData.program_id > 0 ? formData.program_id.toString() : ""}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, program_id: Number.parseInt(value) }))
                  if (formErrors.program_id) setFormErrors((prev) => ({ ...prev, program_id: undefined }))
                }}
              >
                <SelectTrigger id="plo-program">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.program_id && <p className="text-sm text-red-500">{formErrors.program_id}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setEditingPlo(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingPlo ? "Save Changes" : "Create PLO"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete PLO</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the PLO "{deleteConfirm?.title}"? This action cannot be undone.
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

