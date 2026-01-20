// Mock OBE Service for Student Dashboard
import { apiFetch } from "@/lib/api-client"
import type {
  StudentDashboardData,
  CoursePLOData,
  PLODetail,
} from "@/lib/types/obe"

// Mock data generator
const generateMockDashboardData = (studentId: string): StudentDashboardData => {
  return {
    student: {
      id: 1,
      roll_no: "B20082001",
      name: "Abdul Haq",
      batch: "Batch 2021",
      semester: 8,
      cgpa: 3.2,
      domain: "Chemical Engineering",
    },
    program_plos: {
      plo1: 75.5,
      plo2: 68.0,
      plo3: 72.3,
      plo4: 82.1,
      plo5: 65.8,
      plo6: 70.2,
      plo7: 78.9,
      plo8: 73.4,
      plo9: 69.7,
      plo10: 76.3,
      plo11: 71.5,
      plo12: 74.8,
    },
    recent_courses: [
      {
        course_code: "CE-609",
        course_title: "Petroleum Refinery Engineering",
        plo1: 75,
        plo2: 68,
        plo4: 82,
        plo7: 78,
      },
      {
        course_code: "CE-610",
        course_title: "Process Control and Instrumentation",
        plo3: 72,
        plo5: 66,
        plo8: 73,
        plo11: 71,
      },
      {
        course_code: "CE-611",
        course_title: "Chemical Plant Design",
        plo1: 76,
        plo4: 81,
        plo6: 70,
        plo9: 70,
        plo12: 75,
      },
      {
        course_code: "CE-612",
        course_title: "Environmental Engineering",
        plo2: 67,
        plo5: 65,
        plo7: 79,
        plo10: 76,
      },
    ],
    total_courses: 24,
  }
}

const generateMockCoursePLOData = (studentId: string): CoursePLOData => {
  return {
    courses: [
      {
        course_code: "CE-101",
        course_title: "Introduction to Chemical Engineering",
        semester: 1,
        plo1: 78,
        plo2: 72,
        plo3: 75,
      },
      {
        course_code: "CE-201",
        course_title: "Fluid Mechanics",
        semester: 2,
        plo1: 80,
        plo4: 85,
        plo6: 72,
      },
      {
        course_code: "CE-301",
        course_title: "Heat Transfer",
        semester: 3,
        plo2: 70,
        plo5: 68,
        plo7: 75,
      },
      {
        course_code: "CE-401",
        course_title: "Mass Transfer",
        semester: 4,
        plo3: 73,
        plo6: 71,
        plo8: 74,
      },
      {
        course_code: "CE-501",
        course_title: "Chemical Reaction Engineering",
        semester: 5,
        plo1: 76,
        plo4: 82,
        plo9: 69,
        plo11: 72,
      },
      {
        course_code: "CE-601",
        course_title: "Process Equipment Design",
        semester: 6,
        plo2: 68,
        plo5: 66,
        plo7: 78,
        plo10: 75,
      },
      {
        course_code: "CE-609",
        course_title: "Petroleum Refinery Engineering",
        semester: 8,
        plo1: 75,
        plo2: 68,
        plo4: 82,
        plo7: 78,
      },
      {
        course_code: "CE-610",
        course_title: "Process Control and Instrumentation",
        semester: 8,
        plo3: 72,
        plo5: 66,
        plo8: 73,
        plo11: 71,
      },
      {
        course_code: "CE-611",
        course_title: "Chemical Plant Design",
        semester: 8,
        plo1: 76,
        plo4: 81,
        plo6: 70,
        plo9: 70,
        plo12: 75,
      },
      {
        course_code: "CE-612",
        course_title: "Environmental Engineering",
        semester: 8,
        plo2: 67,
        plo5: 65,
        plo7: 79,
        plo10: 76,
      },
    ],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
  }
}

const generateMockPLODetail = (ploNumber: string): PLODetail => {
  const ploTitles: Record<string, string> = {
    plo1: "Engineering Knowledge",
    plo2: "Problem Analysis",
    plo3: "Design/Development of Solutions",
    plo4: "Investigation",
    plo5: "Modern Tool Usage",
    plo6: "The Engineer and Society",
    plo7: "Environment and Sustainability",
    plo8: "Ethics",
    plo9: "Individual and Team Work",
    plo10: "Communication",
    plo11: "Project Management and Finance",
    plo12: "Life-long Learning",
  }

  const mockCourses = [
    { course_code: "CE-101", course_title: "Introduction to Chemical Engineering", score: 78, semester: 1 },
    { course_code: "CE-201", course_title: "Fluid Mechanics", score: 80, semester: 2 },
    { course_code: "CE-501", course_title: "Chemical Reaction Engineering", score: 76, semester: 5 },
    { course_code: "CE-609", course_title: "Petroleum Refinery Engineering", score: 75, semester: 8 },
    { course_code: "CE-611", course_title: "Chemical Plant Design", score: 76, semester: 8 },
  ]

  const average = mockCourses.reduce((sum, course) => sum + course.score, 0) / mockCourses.length

  return {
    ploNumber,
    ploTitle: ploTitles[ploNumber] || `PLO ${ploNumber}`,
    average: Math.round(average * 10) / 10,
    courses: mockCourses,
  }
}

// API Service Functions
export const obeService = {
  // Get student dashboard data
  async getDashboardData(studentId: string): Promise<StudentDashboardData> {
    try {
      const response = await apiFetch(`/api/student/dashboard/${studentId}`)
      if (response.ok) {
        const data = await response.json()
        return data
      }
      // Fallback to mock data
      return generateMockDashboardData(studentId)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Return mock data on error
      return generateMockDashboardData(studentId)
    }
  },

  // Get course-wise PLO data
  async getCoursePLOData(studentId: string, batchId?: string): Promise<CoursePLOData> {
    try {
      const endpoint = batchId
        ? `/api/plo/student/${studentId}/batch/${batchId}`
        : `/api/plo/student/${studentId}`
      const response = await apiFetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        return data
      }
      // Fallback to mock data
      return generateMockCoursePLOData(studentId)
    } catch (error) {
      console.error("Error fetching course PLO data:", error)
      // Return mock data on error
      return generateMockCoursePLOData(studentId)
    }
  },

  // Get individual PLO detail
  async getPLODetail(studentId: string, ploNumber: string): Promise<PLODetail> {
    try {
      const response = await apiFetch(`/api/plo/student/${studentId}/plo/${ploNumber}`)
      if (response.ok) {
        const data = await response.json()
        return data
      }
      // Fallback to mock data
      return generateMockPLODetail(ploNumber)
    } catch (error) {
      console.error("Error fetching PLO detail:", error)
      // Return mock data on error
      return generateMockPLODetail(ploNumber)
    }
  },
}
