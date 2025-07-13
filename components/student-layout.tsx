"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Home, FileText, BookOpen, DollarSign, Clock, Calendar, LogOut, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/student", icon: Home },
  { name: "Marks", href: "/student/marks", icon: FileText },
  { name: "Assignments", href: "/student/assignments", icon: BookOpen },
  { name: "Notes", href: "/student/notes", icon: BookOpen },
  { name: "Fees", href: "/student/fees", icon: DollarSign },
  { name: "Timetable", href: "/student/timetable", icon: Clock },
  { name: "Events", href: "/student/events", icon: Calendar },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-800">{user?.name}</h2>
                <p className="text-sm text-gray-600">Roll: {user?.rollNo}</p>
                <p className="text-xs text-gray-500">Semester {user?.semester}</p>
              </div>
            </div>
          </div>
          <nav className="mt-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="absolute bottom-0 w-64 p-6">
            <Button onClick={logout} variant="outline" className="w-full bg-transparent">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  )
}
