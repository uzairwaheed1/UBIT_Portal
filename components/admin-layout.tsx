"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  GraduationCap,
  UserCheck,
  Calendar,
  Users,
  BookOpen,
  Target,
  Settings,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { 
    name: "Dashboard", 
    href: "/admin", 
    icon: GraduationCap,
    number: "C0"
  },
  { 
    name: "Manage Faculty", 
    href: "/admin/manage-faculty", 
    icon: UserCheck,
    number: "C1"
  },
  { 
    name: "Batch & Semester Management", 
    href: "/admin/batch-semester", 
    icon: Calendar,
    number: "C2"
  },
  { 
    name: "Student Management", 
    href: "/admin/student-management", 
    icon: Users,
    number: "C3"
  },
  { 
    name: "Course Management", 
    href: "/admin/course-management", 
    icon: BookOpen,
    number: "C4"
  },
  { 
    name: "CLO/PLO/PEO Management", 
    href: "/admin/outcome-management", 
    icon: Target,
    number: "C5"
  },
  { 
    name: "OBE Configuration", 
    href: "/admin/obe-config", 
    icon: Settings,
    number: "C6"
  },
  { 
    name: "Reports & Analytics", 
    href: "/admin/reports", 
    icon: BarChart3,
    number: "C7"
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

          <nav className="flex-1 mt-6 px-4 pb-6 overflow-y-auto space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-3 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {item.number}
                  </span>
                  <item.icon className="mr-3 h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                </Link>
              )
            })}
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
