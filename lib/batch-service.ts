import { apiFetch } from "./api-client"

// Type definitions
export interface Batch {
  id: number
  name: string
  year: number
  currentSemester: number
  semester_start_day: number
  semester_start_month: number
  semester_end_day: number
  semester_end_month: number
  status: "Active" | "Graduated" | "Inactive"
  program_id?: number
  program?: {
    id: number
    code: string
    name: string
    department: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface CreateBatchDto {
  name: string
  year: number
  semester_start_day: number
  semester_start_month: number
  semester_end_day: number
  semester_end_month: number
  program_id: number
}

export interface UpdateBatchDto {
  name?: string
  status?: "Active" | "Graduated" | "Inactive"
  program_id?: number
}

export interface BatchSemester {
  number: number
  status: "current" | "completed" | "upcoming"
  startDate?: string
  endDate?: string
}

/**
 * Helper function to map batch data from snake_case to camelCase
 */
function mapBatchData(batch: any): Batch {
  return {
    ...batch,
    currentSemester: batch.current_semester || batch.currentSemester || 1,
    program_id: batch.program_id || batch.programId || batch.program?.id,
  }
}

/**
 * Create a new batch
 */
export async function createBatch(data: CreateBatchDto): Promise<Batch> {
  try {
    const response = await apiFetch("/admin/batches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create batch")
    }

    const result = await response.json()
    const batch = result.data || result
    return mapBatchData(batch)
  } catch (error) {
    console.error("Error creating batch:", error)
    throw error
  }
}

/**
 * Get all batches
 */
export async function getAllBatches(): Promise<Batch[]> {
  try {
    const response = await apiFetch("/admin/batches?page=1&limit=100", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch batches")
    }

    const result = await response.json()
    const batches = result.data || []
    return batches.map(mapBatchData)
  } catch (error) {
    console.error("Error fetching batches:", error)
    throw error
  }
}

/**
 * Get a single batch by ID
 */
export async function getBatchById(id: number): Promise<Batch> {
  try {
    const response = await apiFetch(`/admin/batches/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch batch")
    }

    const result = await response.json()
    const batch = result.data || result
    return mapBatchData(batch)
  } catch (error) {
    console.error("Error fetching batch:", error)
    throw error
  }
}

/**
 * Update a batch
 */
export async function updateBatch(id: number, data: UpdateBatchDto): Promise<Batch> {
  try {
    const response = await apiFetch(`/admin/batches/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update batch")
    }

    const result = await response.json()
    const batch = result.data || result
    return mapBatchData(batch)
  } catch (error) {
    console.error("Error updating batch:", error)
    throw error
  }
}

/**
 * Delete a batch
 */
export async function deleteBatch(id: number): Promise<{ message: string }> {
  try {
    const response = await apiFetch(`/admin/batches/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete batch")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error deleting batch:", error)
    throw error
  }
}

/**
 * Move batch to next semester
 */
export async function moveToNextSemester(id: number): Promise<Batch> {
  try {
    const response = await apiFetch(`/admin/batches/${id}/move-to-next-semester`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to move batch to next semester")
    }

    const result = await response.json()
    const batch = result.data || result
    
    // Map snake_case to camelCase
    return mapBatchData(batch)
  } catch (error) {
    console.error("Error moving batch to next semester:", error)
    throw error
  }
}

/**
 * Graduate a batch
 */
export async function graduateBatch(id: number): Promise<Batch> {
  try {
    const response = await apiFetch(`/admin/batches/${id}/graduate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to graduate batch")
    }

    const result = await response.json()
    const batch = result.data || result
    return mapBatchData(batch)
  } catch (error) {
    console.error("Error graduating batch:", error)
    throw error
  }
}

/**
 * Get batch semesters
 */
export async function getBatchSemesters(id: number): Promise<BatchSemester[]> {
  try {
    const response = await apiFetch(`/admin/batches/${id}/semesters`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch batch semesters")
    }

    const result = await response.json()
    return result.data || result.semesters || result
  } catch (error) {
    console.error("Error fetching batch semesters:", error)
    throw error
  }
}

