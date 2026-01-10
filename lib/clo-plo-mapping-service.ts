import { apiFetch } from "./api-client"

// Type definitions for CLO-PLO Mapping
export interface CloPloMapping {
  id: number
  clo_id: number
  plo_id: number
  domain: string
  level: number
  weightage: number
  createdAt?: string
  updatedAt?: string
  clo?: {
    id: number
    clo_number: number
    description: string
    course_id: number
  }
  plo?: {
    id: number
    code: string
    title: string
    program_id: number
  }
}

export interface CreateCloPloMappingDto {
  clo_id: number
  plo_mappings: {
    plo_id: number
    domain: string
    level: number
    weightage: number
  }[]
}

export interface BulkCloPloMappingDto {
  course_id: number
  mappings: CreateCloPloMappingDto[]
}

export interface GetMappingsParams {
  page?: number
  limit?: number
  courseId?: number
  programId?: number
}

export interface MappingsResponse {
  data: CloPloMapping[]
  total: number
  page: number
  limit: number
}

/**
 * Create bulk CLO-PLO mappings
 */
export async function createBulkCloPloMappings(
  data: BulkCloPloMappingDto
): Promise<{ message: string; count: number }> {
  try {
    const response = await apiFetch("/clo-plo-mappings/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create CLO-PLO mappings")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error creating CLO-PLO mappings:", error)
    throw error
  }
}

/**
 * Get CLO-PLO mappings with filters
 */
export async function getCloPloMappings(params: GetMappingsParams = {}): Promise<MappingsResponse> {
  try {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append("page", params.page.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())
    if (params.courseId) queryParams.append("courseId", params.courseId.toString())
    if (params.programId) queryParams.append("programId", params.programId.toString())

    const url = `/clo-plo-mappings${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

    const response = await apiFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch CLO-PLO mappings")
    }

    const result = await response.json()
    console.log("Result:", JSON.stringify(result, null, 2))
    return result.data || result
  } catch (error) {
    console.error("Error fetching CLO-PLO mappings:", error)
    throw error
  }
}

/**
 * Get CLO-PLO mappings by course ID
 */
export async function getCloPloMappingsByCourseId(courseId: number): Promise<CloPloMapping[]> {
  try {
    const response = await apiFetch(`/clo-plo-mappings/course/${courseId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch CLO-PLO mappings")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error fetching CLO-PLO mappings:", error)
    throw error
  }
}

/**
 * Delete all CLO-PLO mappings for a course
 */
export async function deleteCloPloMappingsByCourseId(
  courseId: number
): Promise<{ message: string }> {
  try {
    const response = await apiFetch(`/clo-plo-mappings/course/${courseId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete CLO-PLO mappings")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error deleting CLO-PLO mappings:", error)
    throw error
  }
}
