import { apiFetch } from "./api-client"

// Type definitions
export interface CourseOffering {
  id: number
  course_id: number
  semester_id: number
  batch_id: number
  instructor_id: number
  course?: {
    id: number
    course_code: string
    course_name: string
    program_id: number
  }
  semester?: {
    id: number
    number: number
    batch_id: number
  }
  batch?: {
    id: number
    name: string
    program_id?: number
  }
  instructor?: {
    id: number
    name: string
    email: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface CreateCourseOfferingDto {
  course_id: number
  semester_id: number
  instructor_id: number
  // Note: batch_id is not needed - backend derives it from semester_id
}

export interface CourseOfferingFilters {
  batch_id?: number
  semester_id?: number
  instructor_id?: number
  page?: number
  limit?: number
}

export interface CourseOfferingListResponse {
  data: CourseOffering[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Get all course offerings with optional filters
 */
export async function getCourseOfferings(
  filters?: CourseOfferingFilters
): Promise<CourseOfferingListResponse | CourseOffering[]> {
  try {
    const params = new URLSearchParams()
    
    if (filters?.batch_id) {
      params.append("batch_id", filters.batch_id.toString())
    }
    if (filters?.semester_id) {
      params.append("semester_id", filters.semester_id.toString())
    }
    if (filters?.instructor_id) {
      params.append("instructor_id", filters.instructor_id.toString())
    }
    if (filters?.page) {
      params.append("page", filters.page.toString())
    }
    if (filters?.limit) {
      params.append("limit", filters.limit.toString())
    }

    const queryString = params.toString()
    const url = queryString ? `/course-offerings?${queryString}` : "/course-offerings"

    const response = await apiFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch course offerings")
    }

    const result = await response.json()
    // Handle both paginated and non-paginated responses
    if (result.data && Array.isArray(result.data)) {
      return result as CourseOfferingListResponse
    }
    return result as CourseOffering[]
  } catch (error) {
    console.error("Error fetching course offerings:", error)
    throw error
  }
}

/**
 * Create a new course offering
 */
export async function createCourseOffering(
  data: CreateCourseOfferingDto
): Promise<CourseOffering> {
  try {
    console.log("📤 [Course Offering Service] Creating course offering:", {
      data,
      note: "batch_id not included - backend derives it from semester_id",
    })
    
    const response = await apiFetch("/course-offerings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create course offering")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error creating course offering:", error)
    throw error
  }
}

/**
 * Get semesters for a batch
 * Uses GET /admin/course-offerings/batch/:batchId/semesters
 */
export async function getSemestersByBatch(batchId: number): Promise<any[]> {
  try {
    console.log(`📤 [Course Offering Service] Fetching semesters for batch ${batchId}...`)
    
    const response = await apiFetch(`/admin/course-offerings/batch/${batchId}/semesters`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }))
      console.error(`❌ [Course Offering Service] Failed to fetch semesters:`, error)
      throw new Error(error.message || "Failed to fetch semesters")
    }

    const result = await response.json()
    console.log(`📥 [Course Offering Service] Semesters response:`, result)
    
    // Handle different response formats
    const semesters = result.data || result.semesters || result || []

    // console.log(`📥 [Course Offering Service] Semesters:`, semesters)
    
    if (!Array.isArray(semesters)) {
      console.warn(`⚠️ [Course Offering Service] Expected array but got:`, typeof semesters)
      return []
    }
    
    // Map semesters to ensure consistent structure
    const mappedSemesters = semesters.map((sem: any) => ({
      id: sem.id || sem.semester_id,
      number: sem.number || sem.semester_number,
      batch_id: sem.batch_id || batchId,
      is_active: sem.is_active !== undefined ? sem.is_active : (sem.status === "active" || sem.status === "current"),
      is_locked: sem.is_locked !== undefined ? sem.is_locked : false,
      status: sem.status,
      start_date: sem.start_date,
      end_date: sem.end_date,
      ...sem,
    }))
    
    console.log(`✅ [Course Offering Service] Mapped ${mappedSemesters.length} semesters`)
    return mappedSemesters
  } catch (error) {
    console.error("❌ [Course Offering Service] Error fetching semesters:", error)
    throw error
  }
}

/**
 * Get active faculty members (instructors)
 */
export async function getActiveFaculty(): Promise<any[]> {
  try {
    console.log("📤 [Course Offering Service] Fetching faculty...")
    const response = await apiFetch("/admin/faculty?page=1&limit=100", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch faculty")
    }

    const result = await response.json()
    const faculty = result.data || result.faculty || result || []

    console.log("📝 [Course Offering Service] Faculty:", faculty)
    if (faculty.length > 0) {
      console.log("📝 [Course Offering Service] Sample faculty object keys:", Object.keys(faculty[0]))
      console.log("📝 [Course Offering Service] Sample faculty object:", faculty[0])
    }
    
    // Filter for active faculty (assuming they have a status field or are all active)
    // Adjust this filter based on your actual faculty data structure
    const filtered = faculty.filter((f: any) => !f.status || f.status === "Active" || f.isActive !== false)
    
    // Map to ensure we use the correct primary key field
    // IMPORTANT: The 'id' field might be user_id, not the faculty table primary key
    // The faculty table primary key could be: faculty_id, facultyProfileId, or a different field
    // We need to use the PRIMARY KEY of the faculty table, NOT user_id
    
    return filtered.map((f: any) => {
      // Log to help identify the correct field
      if (filtered.indexOf(f) === 0) {
        console.log("🔍 [Course Offering Service] Faculty object structure:", {
          allKeys: Object.keys(f),
          id: f.id,
          _id: f._id,
          user_id: f.user_id,
          userId: f.userId,
          faculty_id: f.faculty_id,
          facultyProfileId: f.facultyProfileId,
          fullObject: f,
        })
      }

      // Determine the primary key field
      // Priority order based on common naming conventions:
      // 1. faculty_id (most likely for FacultyProfile table)
      // 2. facultyProfileId (if using camelCase)
      // 3. id (only if it's NOT user_id - but this is risky)
      // NOTE: If 'id' is user_id, we MUST use a different field
      
      const primaryKey = f.faculty_id || f.facultyProfileId
      const userId = f.user_id || f.userId || f.id

      if (!primaryKey && f.id) {
        console.warn(
          "⚠️ [Course Offering Service] No explicit faculty_id found. Using 'id' field, but verify this is NOT user_id.",
          { faculty: f }
        )
      }

      return {
        ...f,
        // Primary key of faculty table (NOT user_id)
        primaryId: primaryKey || f.id || f._id,
        // Original id (might be user_id, so we keep it for reference)
        originalId: f.id,
        // User ID (foreign key to user table)
        userId: userId,
      }
    })
  } catch (error) {
    console.error("Error fetching faculty:", error)
    throw error
  }
}
