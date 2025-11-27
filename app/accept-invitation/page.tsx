"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api-client"
import { CheckCircle2, XCircle, Lock, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const token = searchParams.get("token")

  const [verifying, setVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [formErrors, setFormErrors] = useState({
    password: "",
    confirmPassword: "",
  })

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenError("No invitation token provided")
        setVerifying(false)
        return
      }

      try {
        const response = await apiFetch(`/invitation/verify/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          setTokenValid(true)
        } else {
          const error = await response.json().catch(() => ({ message: "Invalid or expired invitation token" }))
          setTokenError(error.message || "Invalid or expired invitation token")
          setTokenValid(false)
        }
      } catch (error) {
        console.error("Error verifying token:", error)
        setTokenError("Failed to verify invitation token. Please try again later.")
        setTokenValid(false)
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const validateForm = () => {
    const errors = {
      password: "",
      confirmPassword: "",
    }

    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setFormErrors(errors)
    return !errors.password && !errors.confirmPassword
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!token) {
      toast({
        title: "Error",
        description: "Invalid invitation token",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await apiFetch("/invitation/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password set successfully! Redirecting to login...",
        })
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        const error = await response.json().catch(() => ({ message: "Failed to accept invitation" }))
        toast({
          title: "Error",
          description: error.message || "Failed to accept invitation. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error accepting invitation:", error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Lock className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Accept Invitation</CardTitle>
            <CardDescription>Set your password to complete your account setup</CardDescription>
          </CardHeader>
          <CardContent>
            {verifying ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
                <p className="text-gray-600">Verifying invitation token...</p>
              </div>
            ) : tokenError ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{tokenError}</AlertDescription>
              </Alert>
            ) : tokenValid ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Invitation verified! Please set your password below.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                      if (formErrors.password) {
                        setFormErrors((prev) => ({ ...prev, password: "" }))
                      }
                    }}
                    disabled={submitting}
                    className="h-11"
                    required
                  />
                  {formErrors.password && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      if (formErrors.confirmPassword) {
                        setFormErrors((prev) => ({ ...prev, confirmPassword: "" }))
                      }
                    }}
                    disabled={submitting}
                    className="h-11"
                    required
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 bg-purple-600 hover:bg-purple-700" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    "Set Password"
                  )}
                </Button>
              </form>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>Unable to verify invitation. Please contact support.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Already have an account?{" "}
            <a href="/" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

