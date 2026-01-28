"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Users, FileText, BookOpen, DollarSign, Clock, Trophy, LogOut, GraduationCap, Eye, Plus, Upload, UserCheck, Shield, Target, Network, BookMarked, TrendingUp } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: GraduationCap },
  {
    name: "Students",
    icon: Users,
    submenu: [
      { name: "Add Student", href: "/admin/add-student", icon: Plus },
      { name: "View Students", href: "/admin/view-students", icon: Eye },
    ],
  },
  {
    name: "Faculty",
    icon: UserCheck,
    submenu: [
      { name: "Add Faculty", href: "/admin/add-faculty", icon: Plus },
      { name: "View Faculty", href: "/admin/view-faculty", icon: Eye },
    ],
  },
  {
    name: "Admins",
    icon: Shield,
    submenu: [
      { name: "Add Admin", href: "/admin/add-admin", icon: Plus },
      { name: "View Admins", href: "/admin/view-admin", icon: Eye },
    ],
  },
  {
    name: "Academic",
    icon: FileText,
    submenu: [
      { name: "Upload Marks", href: "/admin/upload-marks", icon: Upload },
      { name: "View Marks", href: "/admin/view-marks", icon: Eye },
      { name: "Create Assignment", href: "/admin/create-assignment", icon: Plus },
      { name: "View Assignments", href: "/admin/view-assignments", icon: Eye },
    ],
  },
  {
    name: "OBE Management",
    icon: Target,
    submenu: [
      { name: "Programs", href: "/admin/programs", icon: BookOpen },
      { name: "PLOs", href: "/admin/plos", icon: FileText },
      { name: "Courses", href: "/admin/courses", icon: BookOpen },
      { name: "CLO-PLO Mappings", href: "/admin/clo-plo-mappings", icon: Network },
      { name: "OBE Results", href: "/admin/obe/results", icon: Upload },
      { name: "PLO Attainments", href: "/admin/obe/plo-attainments", icon: TrendingUp },
    ],
  },
  {
    name: "Resources",
    icon: BookOpen,
    submenu: [
      { name: "Upload Notes", href: "/admin/upload-notes", icon: Upload },
      { name: "View Notes", href: "/admin/view-notes", icon: Eye },
      { name: "Manage Courses", href: "/admin/manage-courses", icon: BookOpen },
    ],
  },
  {
    name: "Management",
    icon: DollarSign,
    submenu: [
      { name: "Batch Management", href: "/admin/batch-management", icon: GraduationCap },
      { name: "Course Offerings", href: "/admin/course-offerings", icon: BookMarked },
      { name: "Update Fees", href: "/admin/update-fees", icon: DollarSign },
      { name: "View Fees", href: "/admin/view-fees", icon: Eye },
      { name: "Upload Timetable", href: "/admin/upload-timetable", icon: Clock },
      { name: "View Timetable", href: "/admin/view-timetable", icon: Eye },
      { name: "Upload Events", href: "/admin/upload-events", icon: Trophy },
      { name: "View Events", href: "/admin/view-events", icon: Eye },
    ],
  },
  
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 bg-white shadow-lg border-r flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            <p className="text-sm text-gray-600 mt-1">University Management System</p>
          </div>

          <nav className="flex-1 mt-6 px-4 pb-6 overflow-y-auto">
            {navigation.map((item) => (
              <div key={item.name} className="mb-2">
                {item.submenu ? (
                  <div>
                    <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 mb-2">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                    <div className="ml-6 space-y-1">
                      {item.submenu.map((subItem) => {
                        const isActive = pathname === subItem.href || pathname.startsWith(subItem.href + "/")
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                              isActive
                                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <subItem.icon className="mr-3 h-4 w-4" />
                            {subItem.name}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      pathname === item.href
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Fixed Logout Button at Bottom */}
          <div className="p-6 border-t bg-white">
            <Button onClick={logout} variant="outline" className="w-full bg-transparent">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
