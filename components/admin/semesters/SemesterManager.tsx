"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Plus, Search, Edit, Trash2, Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Semester {
  _id: string;
  semesterId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: "Active" | "Inactive";
}

const SemesterManager: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [formData, setFormData] = useState({
    semesterId: "",
    name: "",
    startDate: "",
    endDate: "",
    status: "Active" as "Active" | "Inactive",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/semester");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch semesters");
      }
      const data = await res.json();
      console.log("Fetched semesters data:", data);
      
      if (!data.semesters || !Array.isArray(data.semesters)) {
        console.warn("Invalid data format:", data);
        setSemesters([]);
        setFilteredSemesters([]);
        return;
      }
      
      // Convert date strings to Date objects
      const semestersWithDates = data.semesters.map((sem: any) => ({
        ...sem,
        startDate: new Date(sem.startDate),
        endDate: new Date(sem.endDate),
      }));
      
      console.log("Processed semesters:", semestersWithDates);
      setSemesters(semestersWithDates);
      setFilteredSemesters(semestersWithDates);
    } catch (error: any) {
      console.error("Error fetching semesters:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to load semesters", 
        variant: "destructive" 
      });
      setSemesters([]);
      setFilteredSemesters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = semesters;
    if (searchTerm) {
      filtered = filtered.filter((sem) => 
        sem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sem.semesterId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== "All") {
      filtered = filtered.filter((sem) => sem.status === filterStatus);
    }
    setFilteredSemesters(filtered);
  }, [searchTerm, filterStatus, semesters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: "Active" | "Inactive") => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const resetForm = () => {
    setFormData({
      semesterId: "",
      name: "",
      startDate: "",
      endDate: "",
      status: "Active",
    });
  };

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (isSubmitting) return;
    
    // Validate form data
    if (!formData.semesterId || !formData.name || !formData.startDate || !formData.endDate) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Submitting form data:", formData);
      
      const res = await fetch("/api/semester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      console.log("API Response:", data);
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add semester");
      }
      
      toast({ title: "Success", description: data.message || "Semester added successfully" });
      setIsAddOpen(false);
      resetForm();
      // Refresh the list immediately
      await fetchSemesters();
    } catch (error: any) {
      console.error("Error adding semester:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add semester. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!currentSemester || isEditing) return;
    
    // Validate form data
    if (!formData.semesterId || !formData.name || !formData.startDate || !formData.endDate) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    setIsEditing(true);

    try {
      const res = await fetch(`/api/semester/${currentSemester._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update semester");
      }
      
      toast({ title: "Success", description: data.message || "Semester updated successfully" });
      setIsEditOpen(false);
      resetForm();
      setCurrentSemester(null);
      await fetchSemesters();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update semester. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDeleting) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/semester/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete semester");
      }
      toast({ title: "Success", description: data.message || "Semester deleted successfully" });
      await fetchSemesters();
    } catch (error: any) {
      console.error("Error deleting semester:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete semester", 
        variant: "destructive" 
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const openEditDialog = (sem: Semester) => {
    setCurrentSemester(sem);
    const startDate = sem.startDate instanceof Date ? sem.startDate : new Date(sem.startDate);
    const endDate = sem.endDate instanceof Date ? sem.endDate : new Date(sem.endDate);
    
    setFormData({
      semesterId: sem.semesterId,
      name: sem.name,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      status: sem.status,
    });
    setIsEditOpen(true);
  };

  const handleSemesterClick = (semesterId: string) => {
    setSelectedSemester(selectedSemester === semesterId ? null : semesterId);
    // You can add navigation or filtering logic here
    console.log("Selected semester:", semesterId);
  };

  return (
    <div className="space-y-6 p-6 bg-background rounded-lg shadow">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Semester Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all semesters in the system</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Semester
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Semester</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="semesterId">Semester ID *</Label>
                <Input 
                  id="semesterId" 
                  name="semesterId" 
                  value={formData.semesterId} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input 
                  type="date" 
                  id="startDate" 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input 
                  type="date" 
                  id="endDate" 
                  name="endDate" 
                  value={formData.endDate} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                disabled={isSubmitting}
                onClick={() => handleAdd()}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clickable Semester Buttons */}
      {!loading && semesters.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-3">Quick Access - Semesters</h2>
          <div className="flex flex-wrap gap-2">
            {semesters.map((sem) => (
              <Button
                key={sem._id}
                variant={selectedSemester === sem._id ? "default" : "outline"}
                onClick={() => handleSemesterClick(sem._id)}
                className={`transition-all ${
                  selectedSemester === sem._id
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                {sem.name}
                {sem.status === "Active" && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                )}
              </Button>
            ))}
          </div>
          {selectedSemester && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Selected: {semesters.find(s => s._id === selectedSemester)?.name}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(value: "All" | "Active" | "Inactive") => setFilterStatus(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Active">Active Only</SelectItem>
            <SelectItem value="Inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
        {semesters.length > 0 && (
          <div className="text-sm text-gray-500">
            Total: {semesters.length} | Showing: {filteredSemesters.length}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading semesters...</span>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Semester ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSemesters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No semesters found. Add a new semester to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredSemesters.map((sem) => (
                <TableRow key={sem._id}>
                  <TableCell>{sem.semesterId}</TableCell>
                  <TableCell>{sem.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {sem.startDate instanceof Date 
                          ? sem.startDate.toLocaleDateString() 
                          : new Date(sem.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {sem.endDate instanceof Date 
                          ? sem.endDate.toLocaleDateString() 
                          : new Date(sem.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={sem.status === "Active" ? "default" : "secondary"}
                      className={sem.status === "Active" ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {sem.status === "Active" ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                      )}
                    </Badge>
                  </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(sem)}
                      className="gap-1"
                      disabled={isEditing}
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="gap-1"
                          disabled={isDeleting === sem._id}
                        >
                          {isDeleting === sem._id ? (
                            <><Loader2 className="h-3 w-3 animate-spin" /> Deleting...</>
                          ) : (
                            <><Trash2 className="h-3 w-3" /> Delete</>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Semester</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <strong>{sem.name}</strong>? 
                            This action cannot be undone and will permanently delete the semester.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(sem._id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Semester</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-semesterId">Semester ID *</Label>
              <Input 
                id="edit-semesterId" 
                name="semesterId" 
                value={formData.semesterId} 
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input 
                id="edit-name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-startDate">Start Date *</Label>
              <Input 
                type="date" 
                id="edit-startDate" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-endDate">End Date *</Label>
              <Input 
                type="date" 
                id="edit-endDate" 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsEditOpen(false);
                resetForm();
                setCurrentSemester(null);
              }}
              disabled={isEditing}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={() => handleEdit()}
              disabled={isEditing}
            >
              {isEditing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SemesterManager;