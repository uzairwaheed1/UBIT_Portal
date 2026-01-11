"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { useToast } from "@/hooks/use-toast"
import { CLO, updateCLO, deleteCLO, UpdateCloDto } from "@/lib/clo-service"
import { Edit, Trash2 } from "lucide-react"

interface CloDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clo: CLO | null
  onSuccess: () => void
}

/**
 * CLO Dialog Component
 * 
 * Displays CLO details in a popup with options to:
 * - View CLO details (clo_number + description)
 * - Edit CLO (transforms to editable form)
 * - Delete CLO (with confirmation)
 */
export function CloDialog({ open, onOpenChange, clo, onSuccess }: CloDialogProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState<UpdateCloDto>({})
  const [errors, setErrors] = useState<{ clo_number?: string; description?: string }>({})

  // Reset state when dialog opens/closes or CLO changes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEditing(false)
      setFormData({})
      setErrors({})
    }
    onOpenChange(newOpen)
  }

  // Enter edit mode
  const handleEdit = () => {
    if (clo) {
      setFormData({
        clo_number: clo.clo_number,
        description: clo.description,
      })
      setIsEditing(true)
      setErrors({})
    }
  }

  // Cancel edit mode
  const handleCancelEdit = () => {
    setFormData({})
    setIsEditing(false)
    setErrors({})
  }

  // Validate form data
  const validate = (): boolean => {
    const newErrors: { clo_number?: string; description?: string } = {}

    if (formData.clo_number !== undefined && formData.clo_number < 1) {
      newErrors.clo_number = "CLO number must be at least 1"
    }

    if (formData.description !== undefined) {
      if (formData.description.trim().length === 0) {
        newErrors.description = "Description cannot be empty"
      } else if (formData.description.length > 1000) {
        newErrors.description = "Description must be 1000 characters or less"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle update submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clo) return

    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      await updateCLO(clo.id, formData)
      toast({
        title: "Success",
        description: "CLO updated successfully",
      })
      setIsEditing(false)
      setFormData({})
      onSuccess()
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update CLO"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!clo) return

    setLoading(true)
    try {
      await deleteCLO(clo.id)
      toast({
        title: "Success",
        description: "CLO deleted successfully",
      })
      setShowDeleteDialog(false)
      handleOpenChange(false)
      onSuccess()
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete CLO"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!clo) return null

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit CLO" : `CLO-${clo.clo_number}`}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the CLO details below."
                : "Course Learning Outcome details"}
            </DialogDescription>
          </DialogHeader>

          {isEditing ? (
            // Edit Mode: Show editable form
            <form onSubmit={handleUpdate}>
              <div className="space-y-4 py-4">
                {/* CLO Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="edit_clo_number">CLO Number</Label>
                  <Input
                    id="edit_clo_number"
                    type="number"
                    min="1"
                    value={formData.clo_number ?? clo.clo_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clo_number: parseInt(e.target.value) || undefined,
                      })
                    }
                    disabled={loading}
                    className={errors.clo_number ? "border-red-500" : ""}
                  />
                  {errors.clo_number && (
                    <p className="text-sm text-red-500">{errors.clo_number}</p>
                  )}
                </div>

                {/* Description Textarea */}
                <div className="space-y-2">
                  <Label htmlFor="edit_description">Description</Label>
                  <Textarea
                    id="edit_description"
                    value={formData.description ?? clo.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    disabled={loading}
                    maxLength={1000}
                    rows={6}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    {errors.description && (
                      <span className="text-red-500">{errors.description}</span>
                    )}
                    <span className={errors.description ? "ml-auto" : ""}>
                      {(formData.description ?? clo.description).length}/1000 characters
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            // View Mode: Show CLO details with Edit/Delete buttons
            <>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">CLO Number</Label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    CLO-{clo.clo_number}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                    {clo.description}
                  </p>
                </div>

                {clo.createdAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Created At</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(clo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete CLO-{clo.clo_number} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

