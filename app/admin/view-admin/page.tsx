"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2, Mail, User, Users, Phone, Briefcase, CheckCircle2, XCircle, Shield, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiFetch } from "@/lib/api-client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UpdateAdminDto {
  name?: string
  email?: string
  designation?: string
  department?: string
  contact_no?: string
}

export default function ViewAdmin() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, adminId: "", adminName: "" })
  const [deleting, setDeleting] = useState(false)
  const [resendingInvitation, setResendingInvitation] = useState<number | null>(null)
  const [editDialog, setEditDialog] = useState({ open: false, admin: null as any })
  const [editing, setEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<UpdateAdminDto>({
    name: "",
    email: "",
    designation: "",
    department: "",
    contact_no: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await apiFetch("/admin/admins?page=1&limit=100", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      const data = await response.json()
      console.log("data", data)
      if (data.success || data.data) {
        // Handle both data.success and data.data response structures
        setAdmins(data.data || data.admins || [])
        console.log("admins", admins)
      }
    } catch (error) {
      console.error("Error fetching admins:", error)
      toast({ title: "Error", description: "Failed to fetch admin data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (adminId: string, adminName: string) => {
    setDeleteDialog({ open: true, adminId, adminName })
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      const response = await apiFetch(`/admin/admins/${deleteDialog.adminId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({ title: "Success", description: "Admin user deleted successfully" })
        fetchAdmins()
      } else {
        toast({ title: "Error", description: "Failed to delete admin user", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setDeleting(false)
      setDeleteDialog({ open: false, adminId: "", adminName: "" })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, adminId: "", adminName: "" })
  }

  const handleEditClick = (admin: any) => {
    setEditFormData({
      name: admin.name || "",
      email: admin.email || "",
      designation: admin.designation || "",
      department: admin.department || "",
      contact_no: admin.contact_no || "",
    })
    setEditDialog({ open: true, admin })
  }

  const handleEditCancel = () => {
    setEditDialog({ open: false, admin: null })
    setEditFormData({
      name: "",
      email: "",
      designation: "",
      department: "",
      contact_no: "",
    })
  }

  const handleEditConfirm = async () => {
    if (!editDialog.admin) return

    setEditing(true)
    try {
      const updateData: UpdateAdminDto = {}
      if (editFormData.name) updateData.name = editFormData.name
      if (editFormData.email) updateData.email = editFormData.email
      if (editFormData.designation) updateData.designation = editFormData.designation
      if (editFormData.department) updateData.department = editFormData.department
      if (editFormData.contact_no) updateData.contact_no = editFormData.contact_no

      const response = await apiFetch(`/admin/admins/${editDialog.admin.id || editDialog.admin._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: "Success", description: "Admin updated successfully" })
        fetchAdmins()
        handleEditCancel()
      } else {
        toast({ title: "Error", description: data.message || "Failed to update admin", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setEditing(false)
    }
  }

  const getAccountStatusVariant = (status: string) => {
    const statusLower = status?.toLowerCase()
    switch (statusLower) {
      case "active":
        return "default"
      case "pending":
        return "secondary"
      case "suspended":
        return "destructive"
      case "inactive":
        return "outline"
      default:
        return "outline"
    }
  }

  const getAccountStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase()
    switch (statusLower) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const resentInvitation = async (id: number | string) => {
    setResendingInvitation(Number(id))
    try {
      const response = await apiFetch(`/admin/users/${id}/resend-invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await response.json()
      
      if (response.ok) {
        toast({ title: "Success", description: "Invitation resent successfully" })
        // Refresh admin list to get updated data
        fetchAdmins()
      } else {
        toast({ title: "Error", description: data.message || "Failed to resent invitation", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setResendingInvitation(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin data...</p>
        </div>
      </div>
    )
  }

  const adminCount = admins.length

  return (
    <div className="space-y-6">
      {/* Header with Count */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-gray-600 mt-2">Manage and view all admin users</p>
        </div>
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold text-blue-600">{adminCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Directory
          </CardTitle>
          <CardDescription>Complete list of all admin users</CardDescription>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No admin users found</p>
              <p className="text-sm text-gray-500">Add admin users to see them here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((member: any) => (
                    <TableRow key={member.id || member._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium align-middle">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-100 p-2 rounded-full flex-shrink-0">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="whitespace-nowrap">{member.name || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-start gap-2 min-w-[200px]">
                          <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-sm break-words">{member.email || "N/A"}</span>
                            {member.email_verified !== undefined && (
                              <div className="flex items-center gap-1">
                                {member.email_verified ? (
                                  <Badge variant="default" className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 flex items-center gap-1 w-fit">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Verified
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 flex items-center gap-1 w-fit">
                                    <XCircle className="h-3 w-3" />
                                    Unverified
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-center">
                          {member.designation ? (
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <Briefcase className="h-3 w-3" />
                              <span className="whitespace-nowrap">{member.designation}</span>
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Not specified</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-center">
                          {member.department ? (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <span className="whitespace-nowrap">{member.department}</span>
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Not specified</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-2">
                          {member.contact_no ? (
                            <>
                              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm whitespace-nowrap">{member.contact_no}</span>
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-center">
                          {member.account_status ? (
                            <Badge
                              variant={getAccountStatusVariant(member.account_status)}
                              className={`flex items-center gap-1 w-fit border ${getAccountStatusColor(member.account_status)}`}
                            >
                              <Shield className="h-3 w-3" />
                              <span className="capitalize whitespace-nowrap">{member.account_status}</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Shield className="h-3 w-3" />
                              N/A
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resentInvitation(member.id || member._id)}
                            disabled={resendingInvitation === Number(member.id || member._id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Resend Invitation"
                          >
                            {resendingInvitation === Number(member.id || member._id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(member)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(member.id || member._id, member.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
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
            <DialogTitle>Delete Admin User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.adminName}</strong>? This action cannot be undone.
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

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={handleEditCancel}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Admin User</DialogTitle>
            <DialogDescription>Update the admin user information below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-designation">Designation</Label>
              <Input
                id="edit-designation"
                value={editFormData.designation}
                onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                placeholder="Enter designation"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                placeholder="Enter department"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contact">Contact Number</Label>
              <Input
                id="edit-contact"
                value={editFormData.contact_no}
                onChange={(e) => setEditFormData({ ...editFormData, contact_no: e.target.value })}
                placeholder="Enter contact number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditCancel} disabled={editing}>
              Cancel
            </Button>
            <Button onClick={handleEditConfirm} disabled={editing}>
              {editing ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

