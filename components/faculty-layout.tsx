"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Home,
  BookOpen,
  Map,
  ClipboardList,
  FileSpreadsheet,
  TrendingUp,
  BarChart,
  LogOut,
  User,
  Mail,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { facultyAuthService } from "@/lib/faculty-auth-service"
import { useToast } from "@/hooks/use-toast"
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

const navigation = [
  { name: "Dashboard", href: "/faculty", icon: Home },
  { name: "Assigned Courses", href: "/faculty/assigned-courses", icon: BookOpen },
  { name: "Course Roadmap", href: "/faculty/course-roadmap", icon: Map },
  { name: "Plan Assessments", href: "/faculty/assessments", icon: ClipboardList },
  { name: "Marks Entry", href: "/faculty/marks-entry", icon: FileSpreadsheet },
  { name: "CLO Attainment", href: "/faculty/clo-attainment", icon: TrendingUp },
  { name: "Reports", href: "/faculty/reports", icon: BarChart },
]

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await facultyAuthService.logout()
      logout()
      router.push("/")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
    } catch (error) {
      console.error("Logout error:", error)
      // Still logout locally even if API fails
      logout()
      router.push("/")
    } finally {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 bg-white shadow-lg border-r flex flex-col">
          {/* User Profile Section */}
          <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-violet-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-800 truncate">{user?.name || "Faculty"}</h2>
                <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user?.email || "faculty@ubit.edu.pk"}
                </p>
              </div>
            </div>
            <div className="text-xs text-purple-600 font-medium">Faculty Portal</div>
          </div>

          <nav className="flex-1 mt-6 px-4 pb-6 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1 ${
                    isActive
                      ? "bg-purple-50 text-purple-700 border-r-2 border-purple-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Fixed Logout Button at Bottom */}
          <div className="p-6 border-t bg-white">
            <Button
              onClick={() => setShowLogoutDialog(true)}
              variant="outline"
              className="w-full bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8 overflow-auto">{children}</div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to logout? You will need to sign in again to access your portal.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

