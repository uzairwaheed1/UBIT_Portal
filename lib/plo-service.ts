import { apiFetch } from "./api-client"

// Type definitions
export interface PLO {
  id: number
  code: string
  title: string
  description: string
  program_id: number
  program?: {
    id: number
    code: string
    name: string
    department: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface CreatePloDto {
  code: string
  title: string
  description: string
  program_id: number
}

export interface UpdatePloDto {
  code?: string
  title?: string
  description?: string
  program_id?: number
}

/**
 * Create a new PLO
 */
export async function createPlo(data: CreatePloDto): Promise<PLO> {
  try {
    const response = await apiFetch("/plos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create PLO")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error creating PLO:", error)
    throw error
  }
}

/**
 * Get all PLOs
 */
export async function getAllPlos(): Promise<PLO[]> {
  try {
    const response = await apiFetch("/plos", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch PLOs")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error fetching PLOs:", error)
    throw error
  }
}

/**
 * Get a single PLO by ID
 */
export async function getPloById(id: number): Promise<PLO> {
  try {
    const response = await apiFetch(`/plos/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch PLO")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error fetching PLO:", error)
    throw error
  }
}

/**
 * Update a PLO
 */
export async function updatePlo(id: number, data: UpdatePloDto): Promise<PLO> {
  try {
    const response = await apiFetch(`/plos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update PLO")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error updating PLO:", error)
    throw error
  }
}

/**
 * Delete a PLO
 */
export async function deletePlo(id: number): Promise<{ message: string }> {
  try {
    const response = await apiFetch(`/plos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete PLO")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error deleting PLO:", error)
    throw error
  }
}

/**
 * Get PLOs by program ID
 */
export async function getPlosByProgramId(programId: number): Promise<PLO[]> {
  try {
    const response = await apiFetch(`/plos/program/${programId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch PLOs")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error fetching PLOs:", error)
    throw error
  }
}
