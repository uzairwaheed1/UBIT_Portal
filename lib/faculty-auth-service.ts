import { apiFetch } from "./api-client"

export interface FacultyLoginCredentials {
  email: string
  password: string
}

export interface FacultyUser {
  id: number
  name: string
  email: string
  role: string
  designation?: string
  department?: string
  contact?: string
}

export interface LoginResponse {
  access_token: string
  user: FacultyUser
}

export const facultyAuthService = {
  // 1. Login API - POST /auth/login
  async login(credentials: FacultyLoginCredentials): Promise<LoginResponse> {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Login failed" }))
      throw new Error(error.message || "Login failed")
    }

    const data = await response.json()

    // Validate Faculty role
    if (data.user.role !== "Faculty") {
      throw new Error("Access denied. Faculty credentials required.")
    }

    return data
  },

  // 2. Get Profile API - GET /auth/profile
  async getProfile(): Promise<FacultyUser> {
    const response = await apiFetch("/auth/profile", {
      method: "GET",
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch profile" }))
      throw new Error(error.message || "Failed to fetch profile")
    }

    return response.json()
  },

  // 3. Logout API - POST /auth/logout
  async logout(): Promise<void> {
    try {
      const response = await apiFetch("/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      // Continue with logout even if API call fails
    } finally {
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("user")
      }
    }
  },
}

