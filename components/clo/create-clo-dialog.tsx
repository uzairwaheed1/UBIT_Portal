"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createCLO, CreateCloDto } from "@/lib/clo-service"

interface CreateCloDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: number
  onSuccess: () => void
}

/**
 * Create CLO Dialog Component
 * 
 * Displays a form to create a new Course Learning Outcome (CLO).
 * Validates input according to CreateCloDto requirements:
 * - clo_number: integer ≥ 1
 * - description: string, max length 1000
 * - course_id: required (prefilled)
 */
export function CreateCloDialog({ open, onOpenChange, courseId, onSuccess }: CreateCloDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateCloDto>({
    course_id: courseId,
    clo_number: 1,
    description: "",
  })
  const [errors, setErrors] = useState<{ clo_number?: string; description?: string }>({})

  // Reset form when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({ course_id: courseId, clo_number: 1, description: "" })
      setErrors({})
    }
    onOpenChange(newOpen)
  }

  // Validate form data
  const validate = (): boolean => {
    const newErrors: { clo_number?: string; description?: string } = {}

    if (!formData.clo_number || formData.clo_number < 1) {
      newErrors.clo_number = "CLO number must be at least 1"
    }

    if (!formData.description || formData.description.trim().length === 0) {
      newErrors.description = "Description is required"
    } else if (formData.description.length > 1000) {
      newErrors.description = "Description must be 1000 characters or less"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      await createCLO(formData)
      toast({
        title: "Success",
        description: "CLO created successfully",
      })
      handleOpenChange(false)
      onSuccess()
    } catch (error: any) {
      // Handle validation errors from backend
      const errorMessage = error.message || "Failed to create CLO"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create CLO</DialogTitle>
          <DialogDescription>
            Create a new Course Learning Outcome for this course.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* CLO Number Input */}
            <div className="space-y-2">
              <Label htmlFor="clo_number">CLO Number</Label>
              <Input
                id="clo_number"
                type="number"
                min="1"
                value={formData.clo_number}
                onChange={(e) =>
                  setFormData({ ...formData, clo_number: parseInt(e.target.value) || 1 })
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter CLO description (max 1000 characters)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={loading}
                maxLength={1000}
                rows={5}
                className={errors.description ? "border-red-500" : ""}
              />
              <div className="flex justify-between text-xs text-gray-500">
                {errors.description && (
                  <span className="text-red-500">{errors.description}</span>
                )}
                <span className={errors.description ? "ml-auto" : ""}>
                  {formData.description.length}/1000 characters
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create CLO"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

