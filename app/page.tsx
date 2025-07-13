"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { GraduationCap, Shield } from "lucide-react"

export default function LoginPage() {
  const [adminCredentials, setAdminCredentials] = useState({ username: "", password: "" })
  const [studentCredentials, setStudentCredentials] = useState({ rollNo: "", password: "" })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminCredentials),
      })

      const data = await response.json()

      if (response.ok) {
        login({ id: data.admin.id, role: "admin" })
        router.push("/admin")
        toast({ title: "Login successful", description: "Welcome to admin panel" })
      } else {
        toast({ title: "Login failed", description: data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentCredentials),
      })

      const data = await response.json()

      if (response.ok) {
        login({
          id: data.student._id,
          role: "student",
          name: data.student.name,
          rollNo: data.student.rollNo,
          semester: data.student.semester,
          domain: data.student.domain,
        })
        router.push("/student")
        toast({ title: "Login successful", description: `Welcome ${data.student.name}` })
      } else {
        toast({ title: "Login failed", description: data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Panel - UBIT Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="mb-8">
            <img
              src="https://i.postimg.cc/0j43LjWV/Whats-App-Image-2025-07-13-at-17-16-04-4263f4a8.jpg"
              alt="UBIT Campus"
              width={400}
              height={300}
              className="rounded-lg shadow-2xl"
            />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">University of Karachi</h1>
            <h2 className="text-2xl font-semibold mb-6">UBIT Student Portal</h2>
            <p className="text-lg opacity-90 max-w-md">
              Department of Computer Science - Your gateway to academic excellence and digital learning
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Forms */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <GraduationCap className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">UBIT Student Portal</h1>
            <p className="text-gray-600 mt-2">Student Management System</p>
          </div>

          <div className="hidden lg:block text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Student Login</CardTitle>
                  <CardDescription>Enter your roll number and password to access your dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rollNo">Roll Number</Label>
                      <Input
                        id="rollNo"
                        type="text"
                        placeholder="Enter your roll number"
                        value={studentCredentials.rollNo}
                        onChange={(e) => setStudentCredentials((prev) => ({ ...prev, rollNo: e.target.value }))}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentPassword">Password</Label>
                      <Input
                        id="studentPassword"
                        type="password"
                        placeholder="Enter your password"
                        value={studentCredentials.password}
                        onChange={(e) => setStudentCredentials((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className="h-11"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Admin Login</CardTitle>
                  <CardDescription>Enter your admin credentials to access the control panel</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter admin username"
                        value={adminCredentials.username}
                        onChange={(e) => setAdminCredentials((prev) => ({ ...prev, username: e.target.value }))}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">Password</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        placeholder="Enter admin password"
                        value={adminCredentials.password}
                        onChange={(e) => setAdminCredentials((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className="h-11"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">Demo Credentials:</p>
            <div className="bg-gray-50 p-3 rounded-lg text-left">
              <p>
                <strong>Admin:</strong> admin / admin123
              </p>
              <p>
                <strong>Student:</strong> Use roll number from admin panel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
