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
import { apiFetch } from "@/lib/api-client"
import { GraduationCap, Shield, BookOpen } from "lucide-react"
import { facultyAuthService } from "@/lib/faculty-auth-service"

export default function LoginPage() {
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" })
  const [studentCredentials, setStudentCredentials] = useState({ rollNo: "", password: "" })
  const [facultyCredentials, setFacultyCredentials] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleAdminLogin = async (e: React.FormEvent) => {
    console.log(adminCredentials)
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminCredentials),
      })

      const data = await response.json()
      console.log(data)

      if (response.ok) {
        const user = data.user
        login({ id: user.id, role: user.role, name: user.name, email: user.email, token: data.access_token })
        router.push("/admin")
        toast({ title: "Login successful", description: `Welcome ${user.name}` })
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
      const response = await apiFetch("/api/auth/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentCredentials),
      })

      const data = await response.json()

      if (response.ok) {
        login({
          id: data.student._id,
          role: "Student",
          name: data.student.name,
          rollNo: data.student.rollNo,
          semester: data.student.semester,
          domain: data.student.domain,
          email: data.student.email,
          token: data.access_token,
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

  const handleFacultyLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await facultyAuthService.login(facultyCredentials)

      // Save to localStorage and auth context
      login({
        id: data.user.id.toString(),
        role: "Faculty",
        name: data.user.name,
        email: data.user.email,
        designation: data.user.designation,
        department: data.user.department,
        contact: data.user.contact,
        token: data.access_token,
      })

      router.push("/faculty")
      toast({
        title: "Login successful",
        description: `Welcome ${data.user.name}`,
      })
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[450px]">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <GraduationCap className="mx-auto h-16 w-16 text-blue-700 mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Chemical Engineering Student Portal</h1>
          <p className="text-gray-700 text-lg font-medium">University of Karachi</p>
          <p className="text-gray-500 text-sm mt-1">Department of Chemical Engineering</p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-transparent p-1 gap-2 h-auto">
            <TabsTrigger
              value="student"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:border-blue-200 data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 data-[state=inactive]:border-gray-200 data-[state=inactive]:hover:bg-gray-50"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="font-medium">Student</span>
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:border-blue-200 data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 data-[state=inactive]:border-gray-200 data-[state=inactive]:hover:bg-gray-50"
            >
              <Shield className="h-4 w-4" />
              <span className="font-medium">Admin</span>
            </TabsTrigger>
            <TabsTrigger
              value="faculty"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:border-blue-200 data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 data-[state=inactive]:border-gray-200 data-[state=inactive]:hover:bg-gray-50"
            >
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">Faculty</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <Card className="shadow-lg bg-white rounded-xl border-0">
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
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card className="shadow-lg bg-white rounded-xl border-0">
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
                      value={adminCredentials.email}
                      onChange={(e) => setAdminCredentials((prev) => ({ ...prev, email: e.target.value }))}
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
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faculty">
            <Card className="shadow-lg bg-white rounded-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl">Faculty Login</CardTitle>
                <CardDescription>Enter your faculty email and password to access your portal</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFacultyLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="facultyEmail">Email</Label>
                    <Input
                      id="facultyEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={facultyCredentials.email}
                      onChange={(e) => setFacultyCredentials((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facultyPassword">Password</Label>
                    <Input
                      id="facultyPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={facultyCredentials.password}
                      onChange={(e) => setFacultyCredentials((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Demo Credentials</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-medium text-gray-600 min-w-[60px]">Admin:</span>
                <span className="text-gray-700">admin / admin123</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-gray-600 min-w-[60px]">Student:</span>
                <span className="text-gray-700">Use roll number from admin panel</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-gray-600 min-w-[60px]">Faculty:</span>
                <span className="text-gray-700">Use faculty email and password</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

