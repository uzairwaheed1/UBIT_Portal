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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  Award,
  Calendar,
  Search,
  BookOpen,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as batchService from "@/lib/batch-service"
import type { Batch, BatchSemester } from "@/lib/batch-service"
import { getAllPrograms, type Program } from "@/lib/program-service"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

// Form validation schema for creating batch
const batchFormSchema = z.object({
  batchName: z.string().min(1, "Batch name is required").min(3, "Batch name must be at least 3 characters"),
  year: z.number().min(2000, "Year must be after 2000").max(2100, "Invalid year"),
  program_id: z.number().min(1, "Program is required"),
  currentSemester: z.number().min(1, "Semester must be between 1-8").max(8, "Semester must be between 1-8"),
  semester_start_day: z.number().min(1, "Day must be between 1-31").max(31, "Day must be between 1-31"),
  semester_start_month: z.number().min(1, "Month must be between 1-12").max(12, "Month must be between 1-12"),
  semester_end_day: z.number().min(1, "Day must be between 1-31").max(31, "Day must be between 1-31"),
  semester_end_month: z.number().min(1, "Month must be between 1-12").max(12, "Month must be between 1-12"),
  status: z.enum(["Active", "Graduated", "Inactive"]),
})

// Form validation schema for editing batch (name, status, and program)
const editBatchFormSchema = z.object({
  batchName: z.string().min(1, "Batch name is required").min(3, "Batch name must be at least 3 characters"),
  status: z.enum(["Active", "Graduated", "Inactive"]),
  program_id: z.number().min(1, "Program is required"),
})

// Helper function to get month name
const getMonthName = (month: number): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months[month - 1] || ""
}

type BatchFormValues = z.infer<typeof batchFormSchema>
type EditBatchFormValues = z.infer<typeof editBatchFormSchema>

export default function BatchManagement() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Batch | null>(null)
  const [viewSemestersBatch, setViewSemestersBatch] = useState<Batch | null>(null)
  const [batchSemesters, setBatchSemesters] = useState<BatchSemester[]>([])
  const [loadingSemesters, setLoadingSemesters] = useState(false)
  const { toast } = useToast()

  // Fetch programs
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: getAllPrograms,
  })

  // Fetch batches on component mount
  useEffect(() => {
    fetchBatches()
  }, [])

  // Fetch batches function
  const fetchBatches = async () => {
    try {
      setLoading(true)
      const data = await batchService.getAllBatches()
      // Ensure currentSemester is set with default value of 1 if not provided
      const mappedBatches = data.map((batch: Batch) => ({
        ...batch,
        currentSemester: batch.currentSemester || 1,
      }))
      setBatches(mappedBatches)
    } catch (error) {
      console.error("Error fetching batches:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch batches",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      batchName: "",
      year: new Date().getFullYear(),
      program_id: 0,
      currentSemester: 1,
      semester_start_day: 1,
      semester_start_month: 1,
      semester_end_day: 30,
      semester_end_month: 6,
      status: "Active",
    },
  })

  const editForm = useForm<EditBatchFormValues>({
    resolver: zodResolver(editBatchFormSchema),
    defaultValues: {
      batchName: "",
      status: "Active",
      program_id: 0,
    },
  })

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isAddDialogOpen && !editingBatch) {
      form.reset()
    }
  }, [isAddDialogOpen, editingBatch, form])

  // Populate edit form when editing
  useEffect(() => {
    if (editingBatch) {
      const programId =
        editingBatch.program_id ||
        (editingBatch as any).programId ||
        editingBatch.program?.id ||
        0

      console.log("📝 [Batch Management] Populating edit form:", {
        editingBatch,
        programId,
        batchKeys: Object.keys(editingBatch),
      })

      editForm.reset({
        batchName: editingBatch.name || "",
        status: editingBatch.status,
        program_id: programId,
      })
    }
  }, [editingBatch, editForm])

  const handleAddBatch = async (values: BatchFormValues) => {
    try {
      setIsSubmitting(true)
      const createData = {
        name: values.batchName,
        year: values.year,
        program_id: values.program_id,
        semester_start_day: values.semester_start_day,
        semester_start_month: values.semester_start_month,
        semester_end_day: values.semester_end_day,
        semester_end_month: values.semester_end_month,
      }

      console.log("📤 [Batch Management] Creating batch:", createData)

      await batchService.createBatch(createData)
      toast({
        title: "Success",
        description: "Batch created successfully",
      })
      setIsAddDialogOpen(false)
      form.reset()
      await fetchBatches()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create batch",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateBatch = async (values: EditBatchFormValues) => {
    if (!editingBatch) return

    try {
      setIsSubmitting(true)
      const updateData = {
        name: values.batchName,
        status: values.status,
        program_id: values.program_id,
      }

      console.log("📤 [Batch Management] Updating batch:", {
        batchId: editingBatch.id,
        updateData,
      })

      await batchService.updateBatch(editingBatch.id, updateData)
      toast({
        title: "Success",
        description: "Batch updated successfully",
      })
      setEditingBatch(null)
      editForm.reset()
      await fetchBatches()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update batch",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (batchId: number) => {
    try {
      setActionLoading("delete")
      await batchService.deleteBatch(batchId)
      toast({
        title: "Success",
        description: "Batch deleted successfully",
      })
      setDeleteConfirm(null)
      await fetchBatches()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete batch",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleMoveToNextSemester = async (batch: Batch) => {
    const currentSem = batch.currentSemester || 1
    if (currentSem >= 8) {
      toast({
        title: "Error",
        description: "Batch is already at the maximum semester",
        variant: "destructive",
      })
      return
    }

    try {
      setActionLoading(batch.id)
      const updatedBatch = await batchService.moveToNextSemester(batch.id)
      toast({
        title: "Batch moved successfully",
        description: `Batch moved to Semester ${updatedBatch.currentSemester || batch.currentSemester + 1}`,
      })
      await fetchBatches()
    } catch (error) {
      toast({
        title: "Failed to move batch",
        description: error instanceof Error ? error.message : "Failed to move batch to next semester",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleGraduate = async (batch: Batch) => {
    const currentSem = batch.currentSemester || 1
    if (currentSem < 8) {
      toast({
        title: "Cannot graduate batch",
        description: `Batch must be in Semester 8 to graduate. Currently in Semester ${currentSem}`,
        variant: "destructive",
      })
      return
    }

    try {
      setActionLoading(batch.id)
      await batchService.graduateBatch(batch.id)
      toast({
        title: "Success",
        description: "Batch graduated successfully",
      })
      await fetchBatches()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to graduate batch",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewSemesters = async (batch: Batch) => {
    try {
      setLoadingSemesters(true)
      setViewSemestersBatch(batch)
      const semesters = await batchService.getBatchSemesters(batch.id)
      setBatchSemesters(semesters)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch semesters",
        variant: "destructive",
      })
      setViewSemestersBatch(null)
    } finally {
      setLoadingSemesters(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Graduated":
        return "secondary"
      case "Inactive":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Graduated":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredBatches = batches.filter((batch) => {
    const batchName = batch.name || ""
    return batchName.toLowerCase().includes(searchTerm.toLowerCase()) || batch.year.toString().includes(searchTerm)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
          <p className="text-gray-600 mt-2">Manage and view all student batches</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GraduationCap className="h-4 w-4" />
            <span>{batches.length} Total Batches</span>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Batch
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by batch name or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Database</CardTitle>
          <CardDescription>Complete list of all batches with their details</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : filteredBatches.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Name</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Current Semester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.map((batch) => (
                    <TableRow key={batch.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{batch.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {batch.year}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const programId = batch.program_id || (batch as any).programId || batch.program?.id
                          const program = programId
                            ? programs.find((p) => p.id === programId) || batch.program
                            : null
                          return program ? (
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{program.name}</span>
                              <span className="text-sm text-gray-500">({program.code})</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Not assigned</span>
                          )
                        })()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Semester {batch.currentSemester || 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(batch.status)}
                          className={`flex items-center gap-1 w-fit border ${getStatusColor(batch.status)}`}
                        >
                          {batch.status === "Active" && <Award className="h-3 w-3" />}
                          {batch.status === "Graduated" && <GraduationCap className="h-3 w-3" />}
                          {batch.status === "Inactive" && <Calendar className="h-3 w-3" />}
                          {batch.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSemesters(batch)}
                            title="View Semesters"
                            disabled={actionLoading !== null}
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMoveToNextSemester(batch)}
                            disabled={actionLoading === batch.id || (batch.currentSemester || 1) >= 8}
                            title="Move to next semester"
                          >
                            {actionLoading === batch.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowRight className="h-4 w-4" />
                            )}
                          </Button>
                          {batch.status === "Active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGraduate(batch)}
                              title="Graduate Batch"
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              disabled={actionLoading !== null}
                            >
                              {actionLoading === batch.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Award className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingBatch(batch)}
                            title="Edit Batch"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            disabled={actionLoading !== null}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteConfirm(batch)}
                            title="Delete Batch"
                            disabled={actionLoading !== null}
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
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No batches found" : "No batches yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No batches found. Create your first batch!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Batch Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Batch</DialogTitle>
            <DialogDescription>Create a new batch with the following details.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddBatch)} className="space-y-4">
              <FormField
                control={form.control}
                name="batchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2021-2025" {...field} />
                    </FormControl>
                    <FormDescription>Enter a descriptive name for the batch</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={new Date().getFullYear().toString()}
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || new Date().getFullYear())}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>Enter the batch year</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="program_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value) || 0)}
                      value={field.value > 0 ? field.value.toString() : undefined}
                      disabled={programsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading programs...
                          </SelectItem>
                        ) : programs.length > 0 ? (
                          programs.map((program) => (
                            <SelectItem key={program.id} value={program.id.toString()}>
                              {program.name} ({program.code})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No programs available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the program for this batch</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">Semester Start Date</div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="semester_start_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Day</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                            value={field.value}
                            min={1}
                            max={31}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="semester_start_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Month</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number.parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {getMonthName(month)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">Semester End Date</div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="semester_end_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Day</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                            value={field.value}
                            min={1}
                            max={31}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="semester_end_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Month</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number.parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {getMonthName(month)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="currentSemester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Semester</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the current semester for this batch</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Graduated">Graduated</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the status of the batch</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Batch"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog open={!!editingBatch} onOpenChange={() => setEditingBatch(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
            <DialogDescription>Update the batch information below.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateBatch)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="batchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2021-2025" {...field} />
                    </FormControl>
                    <FormDescription>Enter a descriptive name for the batch</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="program_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value) || 0)}
                      value={field.value > 0 ? field.value.toString() : undefined}
                      disabled={programsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading programs...
                          </SelectItem>
                        ) : programs.length > 0 ? (
                          programs.map((program) => (
                            <SelectItem key={program.id} value={program.id.toString()}>
                              {program.name} ({program.code})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No programs available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the program for this batch</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Graduated">Graduated</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the status of the batch</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingBatch(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This
              action cannot be undone
              and will affect all students associated with this batch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading === "delete"}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading === "delete"}
            >
              {actionLoading === "delete" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Semesters Dialog */}
      <Dialog open={!!viewSemestersBatch} onOpenChange={() => setViewSemestersBatch(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Batch Semesters - {viewSemestersBatch?.name}
            </DialogTitle>
            <DialogDescription>View all semesters for this batch</DialogDescription>
          </DialogHeader>
          {loadingSemesters ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading semesters...</p>
              </div>
            </div>
          ) : batchSemesters.length > 0 ? (
            <div className="space-y-3 py-4">
              {batchSemesters.map((semester) => (
                <div
                  key={semester.number}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    semester.status === "current"
                      ? "bg-blue-50 border-blue-200"
                      : semester.status === "completed"
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Semester {semester.number}</span>
                  </div>
                  <Badge
                    variant={
                      semester.status === "current"
                        ? "default"
                        : semester.status === "completed"
                          ? "secondary"
                          : "outline"
                    }
                    className={
                      semester.status === "current"
                        ? "bg-blue-600 text-white"
                        : semester.status === "completed"
                          ? "bg-green-600 text-white"
                          : ""
                    }
                  >
                    {semester.status === "current"
                      ? "Current"
                      : semester.status === "completed"
                        ? "Completed"
                        : "Upcoming"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No semesters found</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewSemestersBatch(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

