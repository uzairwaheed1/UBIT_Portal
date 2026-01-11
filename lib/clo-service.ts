import { apiFetch } from "./api-client"

// Type definitions for CLO (Course Learning Outcome)
export interface CLO {
  id: number
  course_id: number
  clo_number: number
  description: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateCloDto {
  course_id: number
  clo_number: number
  description: string
}

export interface UpdateCloDto {
  clo_number?: number
  description?: string
}

/**
 * Create a new CLO
 */
export async function createCLO(data: CreateCloDto): Promise<CLO> {
  try {
    const response = await apiFetch("/clos/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create CLO")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error creating CLO:", error)
    throw error
  }
}

/**
 * Get all CLOs for a course
 */
export async function getCLOsByCourseId(courseId: number): Promise<CLO[]> {
  try {
    const response = await apiFetch(`/clos/course/${courseId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch CLOs")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error fetching CLOs:", error)
    throw error
  }
}

/**
 * Update a CLO
 */
export async function updateCLO(cloId: number, data: UpdateCloDto): Promise<CLO> {
  try {
    const response = await apiFetch(`/clos/${cloId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update CLO")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error updating CLO:", error)
    throw error
  }
}

/**
 * Delete a CLO
 */
export async function deleteCLO(cloId: number): Promise<{ message: string }> {
  try {
    const response = await apiFetch(`/clos/${cloId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete CLO")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error deleting CLO:", error)
    throw error
  }
}

