"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function AddFaculty() {
  const [formData, setFormData] = useState({
    facultyId: "",
    name: "",
    email: "",
    department: "",
    designation: "",
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showAdminFields, setShowAdminFields] = useState(false)
  const { toast } = useToast()

  const handleDesignationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, designation: value }))
    setShowAdminFields(value === "Admin")
    if (value !== "Admin") {
      setFormData((prev) => ({ ...prev, username: "", password: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        isAdmin: formData.designation === "Admin",
      }

      // Remove username/password if not admin
      if (formData.designation !== "Admin") {
        delete submitData.username
        delete submitData.password
      }

      const response = await fetch("/api/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        if (formData.designation === "Admin") {
          toast({
            title: "Success",
            description: `Admin added successfully! Username: ${formData.username}, Password: ${formData.password}`,
          })
        } else {
          toast({
            title: "Success",
            description: `Faculty member added successfully!`,
          })
        }
        setFormData({
          facultyId: "",
          name: "",
          email: "",
          department: "",
          designation: "",
          username: "",
          password: "",
        })
        setShowAdminFields(false)
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Faculty Member</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Faculty Information</CardTitle>
          <CardDescription>Add a new faculty member to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facultyId">Faculty ID</Label>
                <Input
                  id="facultyId"
                  type="text"
                  placeholder="e.g., FAC-001"
                  value={formData.facultyId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, facultyId: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter faculty name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="faculty@university.edu"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                    <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Select value={formData.designation} onValueChange={handleDesignationChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                    <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                    <SelectItem value="Lecturer">Lecturer</SelectItem>
                    <SelectItem value="Lab Instructor">Lab Instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showAdminFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Admin Login Credentials</h3>
                  <p className="text-sm text-blue-700 mb-4">This person will be able to login to the admin panel</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Admin Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter admin username"
                    value={formData.username}
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    required={showAdminFields}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    required={showAdminFields}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Adding Faculty..." : "Add Faculty Member"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
