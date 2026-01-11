import { apiFetch } from "./api-client"

// Type definitions
export interface Course {
  id: number
  course_code: string
  course_name: string
  course_description?: string
  credit_hours: number
  semester_number: number
  course_type: string
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

export interface CreateCourseDto {
  course_code: string
  course_name: string
  course_description?: string
  credit_hours: number
  program_id: number
  semester_number: number
  course_type: string
}

export interface UpdateCourseDto {
  course_code: string
  course_name: string
  course_description?: string
  credit_hours: number
  program_id: number
  semester_number: number
  course_type: string
}

/**
 * Get all courses
 */
export async function getAllCourses(programId?: number): Promise<Course[]> {
  try {
    const url = programId ? `/admin/courses?program_id=${programId}` : "/admin/courses"
    const response = await apiFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch courses")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error fetching courses:", error)
    throw error
  }
}

/**
 * Get a single course by ID
 */
export async function getCourseById(id: number): Promise<Course> {
  try {
    const response = await apiFetch(`/admin/courses/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch course")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error fetching course:", error)
    throw error
  }
}

/**
 * Create a new course
 */
export async function createCourse(data: CreateCourseDto): Promise<Course> {
  try {
    const response = await apiFetch("/admin/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create course")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error creating course:", error)
    throw error
  }
}

/**
 * Update a course
 */
export async function updateCourse(id: number, data: UpdateCourseDto): Promise<Course> {
  try {
    const response = await apiFetch(`/admin/courses/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update course")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error updating course:", error)
    throw error
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(id: number): Promise<{ message: string }> {
  try {
    const response = await apiFetch(`/admin/courses/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete course")
    }

    const result = await response.json()
    return result.data || result
  } catch (error) {
    console.error("Error deleting course:", error)
    throw error
  }
}

