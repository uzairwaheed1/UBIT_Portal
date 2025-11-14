"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Target, Search, Link2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CLO {
  _id: string
  cloId: string
  cloName: string
  description: string
  totalMarks: number
  linkedPLO: string
  course: string
}

interface PLO {
  _id: string
  ploId: string
  ploName: string
  description: string
  linkedPEO: string
  program: string
}

interface PEO {
  _id: string
  peoId: string
  peoName: string
  description: string
  program: string
}

interface Course {
  _id: string
  courseCode: string
  courseName: string
}

export default function OutcomeManagement() {
  const [clos, setClos] = useState<CLO[]>([])
  const [plos, setPlos] = useState<PLO[]>([])
  const [peos, setPeos] = useState<PEO[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [mappings, setMappings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("clo")
  const [isCLODialogOpen, setIsCLODialogOpen] = useState(false)
  const [isPLODialogOpen, setIsPLODialogOpen] = useState(false)
  const [isPEODialogOpen, setIsPEODialogOpen] = useState(false)
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false)
  const [selectedCLO, setSelectedCLO] = useState<CLO | null>(null)
  const [selectedPLO, setSelectedPLO] = useState<PLO | null>(null)
  const [selectedPEO, setSelectedPEO] = useState<PEO | null>(null)
  const [cloFormData, setCloFormData] = useState({
    cloId: "",
    cloName: "",
    description: "",
    totalMarks: 0,
    linkedPLO: "",
    course: "",
  })
  const [ploFormData, setPloFormData] = useState({
    ploId: "",
    ploName: "",
    description: "",
    linkedPEO: "",
    program: "BS Computer Science",
  })
  const [peoFormData, setPeoFormData] = useState({
    peoId: "",
    peoName: "",
    description: "",
    program: "BS Computer Science",
  })
  const [mappingFormData, setMappingFormData] = useState({
    type: "clo-plo",
    cloId: "",
    ploId: "",
    peoId: "",
    courseId: "",
    strength: "Moderate",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([
      fetchCLOs(),
      fetchPLOs(),
      fetchPEOs(),
      fetchCourses(),
      fetchMappings(),
    ])
  }

  const fetchCLOs = async () => {
    try {
      const response = await fetch("/api/clo")
      const data = await response.json()
      if (data.success) setClos(data.clos || [])
    } catch (error) {
      console.error("Failed to fetch CLOs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPLOs = async () => {
    try {
      const response = await fetch("/api/plo")
      const data = await response.json()
      if (data.success) setPlos(data.plos || [])
    } catch (error) {
      console.error("Failed to fetch PLOs:", error)
    }
  }

  const fetchPEOs = async () => {
    try {
      const response = await fetch("/api/peo")
      const data = await response.json()
      if (data.success) setPeos(data.peos || [])
    } catch (error) {
      console.error("Failed to fetch PEOs:", error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      const data = await response.json()
      if (data.success) setCourses(data.courses || [])
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    }
  }

  const fetchMappings = async () => {
    try {
      const [cloPloRes, ploPeoRes] = await Promise.all([
        fetch("/api/outcome-mapping?type=clo-plo"),
        fetch("/api/outcome-mapping?type=plo-peo"),
      ])
      const [cloPloData, ploPeoData] = await Promise.all([
        cloPloRes.json(),
        ploPeoRes.json(),
      ])
      setMappings([
        ...(cloPloData.mappings || []).map((m: any) => ({ ...m, mappingType: "clo-plo" })),
        ...(ploPeoData.mappings || []).map((m: any) => ({ ...m, mappingType: "plo-peo" })),
      ])
    } catch (error) {
      console.error("Failed to fetch mappings:", error)
    }
  }

  const handleCLOSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = "/api/clo"
      const method = selectedCLO ? "PUT" : "POST"
      const body = selectedCLO
        ? { id: selectedCLO._id, ...cloFormData }
        : cloFormData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: selectedCLO ? "CLO updated successfully" : "CLO added successfully",
        })
        setIsCLODialogOpen(false)
        resetCLOForm()
        fetchCLOs()
      } else {
        toast({
          title: "Error",
          description: data.message || "Operation failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handlePLOSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = "/api/plo"
      const method = selectedPLO ? "PUT" : "POST"
      const body = selectedPLO
        ? { id: selectedPLO._id, ...ploFormData }
        : ploFormData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: selectedPLO ? "PLO updated successfully" : "PLO added successfully",
        })
        setIsPLODialogOpen(false)
        resetPLOForm()
        fetchPLOs()
      } else {
        toast({
          title: "Error",
          description: data.message || "Operation failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handlePEOSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = "/api/peo"
      const method = selectedPEO ? "PUT" : "POST"
      const body = selectedPEO
        ? { id: selectedPEO._id, ...peoFormData }
        : peoFormData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: selectedPEO ? "PEO updated successfully" : "PEO added successfully",
        })
        setIsPEODialogOpen(false)
        resetPEOForm()
        fetchPEOs()
      } else {
        toast({
          title: "Error",
          description: data.message || "Operation failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleMappingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/outcome-mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappingFormData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Mapping created successfully",
        })
        setIsMappingDialogOpen(false)
        resetMappingForm()
        fetchMappings()
      } else {
        toast({
          title: "Error",
          description: data.message || "Operation failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const resetCLOForm = () => {
    setCloFormData({
      cloId: "",
      cloName: "",
      description: "",
      totalMarks: 0,
      linkedPLO: "",
      course: "",
    })
    setSelectedCLO(null)
  }

  const resetPLOForm = () => {
    setPloFormData({
      ploId: "",
      ploName: "",
      description: "",
      linkedPEO: "",
      program: "BS Computer Science",
    })
    setSelectedPLO(null)
  }

  const resetPEOForm = () => {
    setPeoFormData({
      peoId: "",
      peoName: "",
      description: "",
      program: "BS Computer Science",
    })
    setSelectedPEO(null)
  }

  const resetMappingForm = () => {
    setMappingFormData({
      type: "clo-plo",
      cloId: "",
      ploId: "",
      peoId: "",
      courseId: "",
      strength: "Moderate",
    })
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>CLO/PLO/PEO Management</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">CLO/PLO/PEO Management</h1>
        <p className="text-gray-600 mt-1">C5 - Define and map learning outcomes</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="clo">CLOs</TabsTrigger>
          <TabsTrigger value="plo">PLOs</TabsTrigger>
          <TabsTrigger value="peo">PEOs</TabsTrigger>
          <TabsTrigger value="mapping">Outcome Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="clo" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">Course Learning Outcomes (CLO)</h2>
            <Dialog open={isCLODialogOpen} onOpenChange={setIsCLODialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetCLOForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add CLO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{selectedCLO ? "Edit CLO" : "Add New CLO"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCLOSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cloId">CLO ID *</Label>
                        <Input
                          id="cloId"
                          value={cloFormData.cloId}
                          onChange={(e) =>
                            setCloFormData({ ...cloFormData, cloId: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cloName">CLO Name *</Label>
                        <Input
                          id="cloName"
                          value={cloFormData.cloName}
                          onChange={(e) =>
                            setCloFormData({ ...cloFormData, cloName: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cloDescription">Description *</Label>
                      <Textarea
                        id="cloDescription"
                        value={cloFormData.description}
                        onChange={(e) =>
                          setCloFormData({ ...cloFormData, description: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cloTotalMarks">Total Marks *</Label>
                        <Input
                          id="cloTotalMarks"
                          type="number"
                          value={cloFormData.totalMarks}
                          onChange={(e) =>
                            setCloFormData({
                              ...cloFormData,
                              totalMarks: parseInt(e.target.value),
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cloLinkedPLO">Linked PLO *</Label>
                        <Select
                          value={cloFormData.linkedPLO}
                          onValueChange={(value) =>
                            setCloFormData({ ...cloFormData, linkedPLO: value })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select PLO" />
                          </SelectTrigger>
                          <SelectContent>
                            {plos.map((plo) => (
                              <SelectItem key={plo._id} value={plo.ploId}>
                                {plo.ploId} - {plo.ploName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cloCourse">Course *</Label>
                      <Select
                        value={cloFormData.course}
                        onValueChange={(value) =>
                          setCloFormData({ ...cloFormData, course: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course._id} value={course._id}>
                              {course.courseCode} - {course.courseName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCLODialogOpen(false)
                        resetCLOForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">{selectedCLO ? "Update" : "Add"} CLO</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>CLO List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CLO ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Linked PLO</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clos.map((clo) => (
                    <TableRow key={clo._id}>
                      <TableCell className="font-medium">{clo.cloId}</TableCell>
                      <TableCell>{clo.cloName}</TableCell>
                      <TableCell className="max-w-xs truncate">{clo.description}</TableCell>
                      <TableCell>{clo.totalMarks}</TableCell>
                      <TableCell>{clo.linkedPLO}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plo" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">Program Learning Outcomes (PLO)</h2>
            <Dialog open={isPLODialogOpen} onOpenChange={setIsPLODialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetPLOForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add PLO
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedPLO ? "Edit PLO" : "Add New PLO"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePLOSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ploId">PLO ID *</Label>
                        <Input
                          id="ploId"
                          value={ploFormData.ploId}
                          onChange={(e) =>
                            setPloFormData({ ...ploFormData, ploId: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ploName">PLO Name *</Label>
                        <Input
                          id="ploName"
                          value={ploFormData.ploName}
                          onChange={(e) =>
                            setPloFormData({ ...ploFormData, ploName: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ploDescription">Description *</Label>
                      <Textarea
                        id="ploDescription"
                        value={ploFormData.description}
                        onChange={(e) =>
                          setPloFormData({ ...ploFormData, description: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ploLinkedPEO">Linked PEO *</Label>
                      <Select
                        value={ploFormData.linkedPEO}
                        onValueChange={(value) =>
                          setPloFormData({ ...ploFormData, linkedPEO: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select PEO" />
                        </SelectTrigger>
                        <SelectContent>
                          {peos.map((peo) => (
                            <SelectItem key={peo._id} value={peo.peoId}>
                              {peo.peoId} - {peo.peoName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsPLODialogOpen(false)
                        resetPLOForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">{selectedPLO ? "Update" : "Add"} PLO</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>PLO List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PLO ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Linked PEO</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plos.map((plo) => (
                    <TableRow key={plo._id}>
                      <TableCell className="font-medium">{plo.ploId}</TableCell>
                      <TableCell>{plo.ploName}</TableCell>
                      <TableCell className="max-w-xs truncate">{plo.description}</TableCell>
                      <TableCell>{plo.linkedPEO}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peo" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">Program Educational Objectives (PEO)</h2>
            <Dialog open={isPEODialogOpen} onOpenChange={setIsPEODialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetPEOForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add PEO
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedPEO ? "Edit PEO" : "Add New PEO"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePEOSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peoId">PEO ID *</Label>
                        <Input
                          id="peoId"
                          value={peoFormData.peoId}
                          onChange={(e) =>
                            setPeoFormData({ ...peoFormData, peoId: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="peoName">PEO Name *</Label>
                        <Input
                          id="peoName"
                          value={peoFormData.peoName}
                          onChange={(e) =>
                            setPeoFormData({ ...peoFormData, peoName: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="peoDescription">Description *</Label>
                      <Textarea
                        id="peoDescription"
                        value={peoFormData.description}
                        onChange={(e) =>
                          setPeoFormData({ ...peoFormData, description: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsPEODialogOpen(false)
                        resetPEOForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">{selectedPEO ? "Update" : "Add"} PEO</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>PEO List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PEO ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peos.map((peo) => (
                    <TableRow key={peo._id}>
                      <TableCell className="font-medium">{peo.peoId}</TableCell>
                      <TableCell>{peo.peoName}</TableCell>
                      <TableCell className="max-w-xs truncate">{peo.description}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">Outcome Mapping</h2>
            <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetMappingForm}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Create Mapping
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Outcome Mapping</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleMappingSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="mappingType">Mapping Type *</Label>
                      <Select
                        value={mappingFormData.type}
                        onValueChange={(value) =>
                          setMappingFormData({ ...mappingFormData, type: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clo-plo">CLO → PLO</SelectItem>
                          <SelectItem value="plo-peo">PLO → PEO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {mappingFormData.type === "clo-plo" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="mappingCLO">CLO *</Label>
                          <Select
                            value={mappingFormData.cloId}
                            onValueChange={(value) =>
                              setMappingFormData({ ...mappingFormData, cloId: value })
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select CLO" />
                            </SelectTrigger>
                            <SelectContent>
                              {clos.map((clo) => (
                                <SelectItem key={clo._id} value={clo._id}>
                                  {clo.cloId} - {clo.cloName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mappingPLO">PLO *</Label>
                          <Select
                            value={mappingFormData.ploId}
                            onValueChange={(value) =>
                              setMappingFormData({ ...mappingFormData, ploId: value })
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select PLO" />
                            </SelectTrigger>
                            <SelectContent>
                              {plos.map((plo) => (
                                <SelectItem key={plo._id} value={plo._id}>
                                  {plo.ploId} - {plo.ploName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mappingCourse">Course *</Label>
                          <Select
                            value={mappingFormData.courseId}
                            onValueChange={(value) =>
                              setMappingFormData({ ...mappingFormData, courseId: value })
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses.map((course) => (
                                <SelectItem key={course._id} value={course._id}>
                                  {course.courseCode} - {course.courseName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    {mappingFormData.type === "plo-peo" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="mappingPLO2">PLO *</Label>
                          <Select
                            value={mappingFormData.ploId}
                            onValueChange={(value) =>
                              setMappingFormData({ ...mappingFormData, ploId: value })
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select PLO" />
                            </SelectTrigger>
                            <SelectContent>
                              {plos.map((plo) => (
                                <SelectItem key={plo._id} value={plo._id}>
                                  {plo.ploId} - {plo.ploName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mappingPEO">PEO *</Label>
                          <Select
                            value={mappingFormData.peoId}
                            onValueChange={(value) =>
                              setMappingFormData({ ...mappingFormData, peoId: value })
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select PEO" />
                            </SelectTrigger>
                            <SelectContent>
                              {peos.map((peo) => (
                                <SelectItem key={peo._id} value={peo._id}>
                                  {peo.peoId} - {peo.peoName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="mappingStrength">Strength *</Label>
                      <Select
                        value={mappingFormData.strength}
                        onValueChange={(value) =>
                          setMappingFormData({ ...mappingFormData, strength: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Strong">Strong</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Weak">Weak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsMappingDialogOpen(false)
                        resetMappingForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Mapping</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Mappings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Strength</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping._id}>
                      <TableCell>{mapping.mappingType}</TableCell>
                      <TableCell>
                        {mapping.mappingType === "clo-plo"
                          ? `${mapping.cloId?.cloId} - ${mapping.cloId?.cloName}`
                          : `${mapping.ploId?.ploId} - ${mapping.ploId?.ploName}`}
                      </TableCell>
                      <TableCell>
                        {mapping.mappingType === "clo-plo"
                          ? `${mapping.ploId?.ploId} - ${mapping.ploId?.ploName}`
                          : `${mapping.peoId?.peoId} - ${mapping.peoId?.peoName}`}
                      </TableCell>
                      <TableCell>{mapping.strength}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

