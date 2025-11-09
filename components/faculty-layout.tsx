"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Users,
  FileText,
  BookOpen,
  Clock,
  Upload,
  Eye,
  LogOut,
  UserCheck,
  Plus,
  BarChart3,
  GraduationCap,
  ClipboardList,
  PenTool,
  Settings,
  LineChart,
  Lock,
  BookLock,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const navigation = [
  { 
    name: "Dashboard", 
    href: "/faculty", 
    icon: GraduationCap 
  },
  {
    name: "My Courses",
    href: "/faculty/courses",
    icon: BookOpen,
  },
  {
    name: "Assessment Roadmap",
    href: "/faculty/assessments/roadmap",
    icon: LineChart,
  },
  {
    name: "Terminal Mapping",
    href: "/faculty/assessments/terminal-mapping",
    icon: BookLock,
  },
  {
    name: "Marks Entry",
    icon: FileText,
    submenu: [
      { name: "Manual Entry", href: "/faculty/marks/entry", icon: PenTool },
      { name: "Bulk Upload", href: "/faculty/marks/bulk-upload", icon: Upload },
      { name: "View Marks", href: "/faculty/marks/view", icon: Eye },
      { name: "Lock Evaluation", href: "/faculty/marks/lock-evaluation", icon: Lock },
    ],
  },
  {
    name: "Reports",
    icon: BarChart3,
    submenu: [
      { name: "CLO Attainment", href: "/faculty/reports/clo-attainment", icon: LineChart },
      { name: "Assessment Performance", href: "/faculty/reports/assessment-performance", icon: BarChart3 },
    ],
  },
  {
    name: "Profile",
    href: "/faculty/profile",
    icon: Settings,
  },
]

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 bg-white shadow-lg border-r flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Faculty Panel</h2>
            <p className="text-sm text-gray-600 mt-1">University Management System</p>
          </div>

          <nav className="flex-1 mt-6 px-4 pb-6 overflow-y-auto">
            <Accordion type="multiple" className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <AccordionItem value={item.name} className="border-b-0">
                      <AccordionTrigger className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:no-underline">
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </AccordionTrigger>
                      <AccordionContent className="ml-6 space-y-1 pb-0">
                        {item.submenu.map((subItem) => {
                          const isActive = pathname === subItem.href
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
                      </AccordionContent>
                    </AccordionItem>
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
            </Accordion>
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