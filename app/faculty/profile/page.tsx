"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

// Mock data for profile
const mockProfile = {
  employeeId: "FAC-001",
  name: "Dr. John Doe",
  department: "Computer Science",
  assignedCourses: ["CS101", "CS201", "CS301"],
  photo: "/placeholder.svg?height=128&width=128",
  email: "john.doe@university.edu",
  phone: "+1 (555) 123-4567",
  officeLocation: "Building A, Room 205",
  officeHours: "Mon-Fri 10AM-12PM",
  bio: "Experienced faculty in AI and Machine Learning with 10+ years of teaching.",
};

export default function ProfileSettings() {
  const [profile, setProfile] = useState(mockProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // TODO: Implement API call to save changes
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.photo} alt="Profile Photo" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            {isEditing ? (
              <Button variant="outline">Upload New Photo</Button>
            ) : null}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Employee ID</Label>
              <Input value={profile.employeeId} disabled />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={profile.name} disabled />
            </div>
            <div>
              <Label>Department</Label>
              <Input value={profile.department} disabled />
            </div>
            <div>
              <Label>Assigned Courses</Label>
              <Input value={profile.assignedCourses.join(", ")} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Office Location</Label>
              <Input
                name="officeLocation"
                value={profile.officeLocation}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Office Hours</Label>
              <Input
                name="officeHours"
                value={profile.officeHours}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div>
            <Label>Bio</Label>
            <Textarea
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}