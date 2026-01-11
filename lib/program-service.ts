import { apiFetch } from "./api-client"

// Type definitions
export interface Program {
  id: number
  code: string
  name: string
  department: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateProgramDto {
  code: string
  name: string
  department: string
}

export interface UpdateProgramDto {
  code?: string
  name?: string
  department?: string
}

/**
 * Create a new program
 */
export async function createProgram(data: CreateProgramDto): Promise<Program> {
  try {
    const response = await apiFetch("/admin/programs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create program")
    }

    const result = await response.json()
    console.log(result);
    
    return result.data || result
  } catch (error) {
    console.error("Error creating program:", error)
    throw error
  }
}

/**
 * Get all programs
 */
export async function getAllPrograms(): Promise<Program[]> {
  try {
    const response = await apiFetch("/admin/programs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch programs")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error fetching programs:", error)
    throw error
  }
}

/**
 * Get a single program by ID
 */
export async function getProgramById(id: number): Promise<Program> {
  try {
    const response = await apiFetch(`/admin/programs/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch program")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error fetching program:", error)
    throw error
  }
}

/**
 * Update a program
 */
export async function updateProgram(id: number, data: UpdateProgramDto): Promise<Program> {
  try {
    const response = await apiFetch(`/admin/programs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update program")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error updating program:", error)
    throw error
  }
}

/**
 * Delete a program
 */
export async function deleteProgram(id: number): Promise<{ message: string }> {
  try {
    const response = await apiFetch(`/admin/programs/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete program")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error deleting program:", error)
    throw error
  }
}

