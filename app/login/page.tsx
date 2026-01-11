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
import { GraduationCap, Shield, BookOpen, User, Laptop, Search, Leaf, FileText, UserPlus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { facultyAuthService } from "@/lib/faculty-auth-service"

export default function LoginPage() {
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" })
  const [studentCredentials, setStudentCredentials] = useState({ rollNo: "", password: "" })
  const [facultyCredentials, setFacultyCredentials] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("student")
  const [showRegister, setShowRegister] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    roll_no: "",
    gender: "",
    date_of_birth: "",
    contact_no: "",
    address: "",
    father_name: "",
    father_contact: "",
    emergency_contact: "",
  })
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const getWelcomeText = () => {
    const roleMap: { [key: string]: string } = {
      student: "Student",
      admin: "Admin",
      faculty: "Faculty",
    }
    return roleMap[activeTab] || "Student"
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterLoading(true)

    try {
      // Prepare data - only include fields that have values
      const submitData: any = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        roll_no: registerData.roll_no,
      }

      // Add optional fields only if they have values
      if (registerData.gender) submitData.gender = registerData.gender
      if (registerData.date_of_birth) submitData.date_of_birth = registerData.date_of_birth
      if (registerData.contact_no) submitData.contact_no = registerData.contact_no
      if (registerData.address) submitData.address = registerData.address
      if (registerData.father_name) submitData.father_name = registerData.father_name
      if (registerData.father_contact) submitData.father_contact = registerData.father_contact
      if (registerData.emergency_contact) submitData.emergency_contact = registerData.emergency_contact

      const response = await apiFetch("/api/auth/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. Please login to continue.",
        })
        setShowRegister(false)
        // Reset form
        setRegisterData({
          name: "",
          email: "",
          password: "",
          roll_no: "",
          gender: "",
          date_of_birth: "",
          contact_no: "",
          address: "",
          father_name: "",
          father_contact: "",
          emergency_contact: "",
        })
      } else {
        toast({
          title: "Registration failed",
          description: data.message || "Failed to register. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRegisterLoading(false)
    }
  }

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
    <div className="min-h-screen flex">
      {/* Left Column - Welcome Section (Hero Gradient) */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden h-screen sticky top-0"
        style={{
          background: "linear-gradient(135deg, #1a1f3a 0%, #2d1b4e 100%)",
        }}
      >
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-md text-center">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Welcome to {getWelcomeText()} Portal
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Login to access your account
          </p>

          {/* Illustration */}
          <div className="relative mt-8">
            <div className="flex items-center justify-center gap-8">
              {/* Left Figure - Person with phone */}
              <div className="flex flex-col items-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-2 border border-white/20">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="w-12 h-16 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-end justify-center p-2">
                  <div className="w-8 h-10 bg-white/20 rounded"></div>
                </div>
              </div>

              {/* Center - Document with magnifying glass */}
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 w-32 h-40 flex items-center justify-center">
                  <FileText className="h-16 w-16 text-white/80" />
                </div>
                <div className="absolute -top-4 -right-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Right Figure - Person with laptop */}
              <div className="flex flex-col items-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-2 border border-white/20">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="w-16 h-12 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center">
                  <Laptop className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Plant decoration */}
            <div className="absolute -bottom-4 right-8">
              <Leaf className="h-12 w-12 text-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form (Light Theme) */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 lg:p-12 min-h-screen">
        <div className="w-full max-w-[450px]">
          {/* Compact Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ChemE Portal</h1>
                <p className="text-xs text-gray-500">Chemical Engineering Department</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="student" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1 gap-1 h-auto rounded-lg">
              <TabsTrigger
                value="student"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="font-medium text-sm">Student</span>
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
              >
                <Shield className="h-4 w-4" />
                <span className="font-medium text-sm">Admin</span>
              </TabsTrigger>
              <TabsTrigger
                value="faculty"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
              >
                <BookOpen className="h-4 w-4" />
                <span className="font-medium text-sm">Faculty</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="mt-0">
              {!showRegister ? (
                <Card className="shadow-md bg-white rounded-lg border border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Login</CardTitle>
                    <CardDescription className="text-sm">Enter your account details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rollNo" className="text-sm font-medium">Roll Number</Label>
                      <Input
                        id="rollNo"
                        type="text"
                        placeholder="Enter your roll number"
                        value={studentCredentials.rollNo}
                        onChange={(e) => setStudentCredentials((prev) => ({ ...prev, rollNo: e.target.value }))}
                        required
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentPassword" className="text-sm font-medium">Password</Label>
                      <Input
                        id="studentPassword"
                        type="password"
                        placeholder="Enter your password"
                        value={studentCredentials.password}
                        onChange={(e) => setStudentCredentials((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                        Forgot Password?
                      </a>
                    </div>
                    <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium" disabled={loading}>
                      {loading ? "Signing in..." : "Login"}
                    </Button>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                      onClick={() => setShowRegister(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register
                    </Button>
                  </form>
                </CardContent>
              </Card>
              ) : (
                <Card className="shadow-md bg-white rounded-lg border border-gray-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Register</CardTitle>
                        <CardDescription className="text-sm">Create your student account</CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRegister(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Back to Login
                      </Button>
                    </div>
                  </CardHeader>
                   <CardContent>
                     <form onSubmit={handleRegister} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                      {/* Required Fields */}
                      <div className="space-y-2">
                        <Label htmlFor="reg-name" className="text-sm font-medium">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="reg-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={registerData.name}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, name: e.target.value }))}
                          required
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-email" className="text-sm font-medium">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="Enter your email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
                          required
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-sm font-medium">
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="Minimum 8 characters"
                          value={registerData.password}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                          required
                          minLength={8}
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500">Password must be at least 8 characters</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-roll-no" className="text-sm font-medium">
                          Roll Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="reg-roll-no"
                          type="text"
                          placeholder="Enter your roll number"
                          value={registerData.roll_no}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, roll_no: e.target.value }))}
                          required
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500">Must be pre-registered by admin</p>
                      </div>

                      {/* Optional Fields */}
                      <div className="space-y-2">
                        <Label htmlFor="reg-gender" className="text-sm font-medium">Gender</Label>
                        <Select value={registerData.gender} onValueChange={(value) => setRegisterData((prev) => ({ ...prev, gender: value }))}>
                          <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-dob" className="text-sm font-medium">Date of Birth</Label>
                        <Input
                          id="reg-dob"
                          type="date"
                          value={registerData.date_of_birth}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, date_of_birth: e.target.value }))}
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-contact" className="text-sm font-medium">Contact Number</Label>
                        <Input
                          id="reg-contact"
                          type="tel"
                          placeholder="+92-300-1234567"
                          value={registerData.contact_no}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, contact_no: e.target.value }))}
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-address" className="text-sm font-medium">Address</Label>
                        <Input
                          id="reg-address"
                          type="text"
                          placeholder="Enter your residential address"
                          value={registerData.address}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, address: e.target.value }))}
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-father-name" className="text-sm font-medium">Father's Name</Label>
                        <Input
                          id="reg-father-name"
                          type="text"
                          placeholder="Enter father's name"
                          value={registerData.father_name}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, father_name: e.target.value }))}
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-father-contact" className="text-sm font-medium">Father's Contact</Label>
                        <Input
                          id="reg-father-contact"
                          type="tel"
                          placeholder="+92-300-9876543"
                          value={registerData.father_contact}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, father_contact: e.target.value }))}
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-emergency" className="text-sm font-medium">Emergency Contact</Label>
                        <Input
                          id="reg-emergency"
                          type="tel"
                          placeholder="+92-321-1234567"
                          value={registerData.emergency_contact}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, emergency_contact: e.target.value }))}
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                        disabled={registerLoading}
                      >
                        {registerLoading ? "Registering..." : "Register"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="admin" className="mt-0">
              <Card className="shadow-md bg-white rounded-lg border border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Login</CardTitle>
                  <CardDescription className="text-sm">Enter your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter admin username"
                        value={adminCredentials.email}
                        onChange={(e) => setAdminCredentials((prev) => ({ ...prev, email: e.target.value }))}
                        required
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword" className="text-sm font-medium">Password</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        placeholder="Enter admin password"
                        value={adminCredentials.password}
                        onChange={(e) => setAdminCredentials((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                        Forgot Password?
                      </a>
                    </div>
                    <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium" disabled={loading}>
                      {loading ? "Signing in..." : "Login"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faculty" className="mt-0">
              <Card className="shadow-md bg-white rounded-lg border border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Login</CardTitle>
                  <CardDescription className="text-sm">Enter your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFacultyLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="facultyEmail" className="text-sm font-medium">Email</Label>
                      <Input
                        id="facultyEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={facultyCredentials.email}
                        onChange={(e) => setFacultyCredentials((prev) => ({ ...prev, email: e.target.value }))}
                        required
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facultyPassword" className="text-sm font-medium">Password</Label>
                      <Input
                        id="facultyPassword"
                        type="password"
                        placeholder="Enter your password"
                        value={facultyCredentials.password}
                        onChange={(e) => setFacultyCredentials((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                        Forgot Password?
                      </a>
                    </div>
                    <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium" disabled={loading}>
                      {loading ? "Signing in..." : "Login"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

