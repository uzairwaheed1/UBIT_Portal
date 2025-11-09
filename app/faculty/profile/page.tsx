"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "@/components/ui/use-toast";

export default function ProfileSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    email: user?.email || "areed@uni.edu",
    phone: "555-123-4567",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // TODO: Implement API call to save changes
    toast({
      title: "Success",
      description: "Profile updated successfully!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Update Profile & Contact Information</h1>
        <p className="text-gray-600 mt-1">Update your basic contact information</p>
      </div>
      
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                value={profile.phone}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}