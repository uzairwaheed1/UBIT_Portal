import { apiFetch } from "./api-client"

export interface ParsedStudent {
  roll_no: string
  student_name: string
  plo1: number | null
  plo2: number | null
  plo3: number | null
  plo4: number | null
  plo5: number | null
  plo6: number | null
  plo7: number | null
  plo8: number | null
  plo9: number | null
  plo10: number | null
  plo11: number | null
  plo12: number | null
}

export interface UploadBulkRequest {
  course_code: string
  batch_id: number
  students: ParsedStudent[]
}

export interface UploadBulkResponse {
  success: boolean
  message: string
  inserted_count: number
}

export interface BatchWithResults {
  batch_id: number
  batch_name: string
  courses_count: number
}

export interface CourseResult {
  course_code: string
  course_name: string
  semester: number
  students_count: number
  uploaded_at: string
  uploaded_by: string
}

export interface CourseResultDetail {
  metadata: {
    course_code: string
    course_name: string
    batch_name: string
    semester: number
    total_students: number
    uploaded_at: string
  }
  students: Array<{
    seat_no: string
    student_name: string
    plo1_value: number | null
    plo2_value: number | null
    plo3_value: number | null
    plo4_value: number | null
    plo5_value: number | null
    plo6_value: number | null
    plo7_value: number | null
    plo8_value: number | null
    plo9_value: number | null
    plo10_value: number | null
    plo11_value: number | null
    plo12_value: number | null
  }>
}

/**
 * Upload bulk PLO results
 */
export async function uploadBulkPLOResults(data: UploadBulkRequest): Promise<UploadBulkResponse> {
  try {
    const response = await apiFetch("/api/plo/upload-bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // If response is not JSON, use status text
      }
      
      throw new Error(errorMessage)
    }

    const result = await response.json()
    
    // Handle wrapped response
    if (result.data) {
      return result.data
    }
    
    return result
  } catch (error) {
    console.error("Error uploading PLO results:", error)
    
    // Re-throw with better error message if it's not already an Error
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error(error instanceof Error ? error.message : "Failed to upload PLO results")
  }
}

/**
 * Get all batches with uploaded results
 */
export async function getBatchesWithResults(): Promise<BatchWithResults[]> {
  try {
    const response = await apiFetch("/api/obe/results/batches", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch batches with results")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error fetching batches with results:", error)
    throw error
  }
}

/**
 * Get all courses with results for a specific batch
 */
export async function getBatchCourseResults(batchId: string | number): Promise<CourseResult[]> {
  try {
    const response = await apiFetch(`/api/obe/results/batch/${batchId}/courses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch batch course results")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error fetching batch course results:", error)
    throw error
  }
}

/**
 * Get detailed course results for a specific batch and course
 */
export async function getCourseResultDetail(
  batchId: string | number,
  courseCode: string,
): Promise<CourseResultDetail> {
  try {
    const response = await apiFetch(`/api/obe/results/batch/${batchId}/course/${courseCode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch course result detail")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error fetching course result detail:", error)
    throw error
  }
}

