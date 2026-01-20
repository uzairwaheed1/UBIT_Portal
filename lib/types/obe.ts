// OBE (Outcome-Based Education) TypeScript Types

export interface Student {
  id: number
  roll_no: string
  name: string
  batch: string
  semester: number
  cgpa: number
  domain?: string
}

export interface ProgramPLOs {
  plo1: number
  plo2: number
  plo3: number
  plo4: number
  plo5: number
  plo6: number
  plo7: number
  plo8: number
  plo9: number
  plo10: number
  plo11: number
  plo12: number
}

export interface CoursePLO {
  course_code: string
  course_title: string
  semester?: number
  plo1?: number
  plo2?: number
  plo3?: number
  plo4?: number
  plo5?: number
  plo6?: number
  plo7?: number
  plo8?: number
  plo9?: number
  plo10?: number
  plo11?: number
  plo12?: number
}

export interface RecentCourse {
  course_code: string
  course_title: string
  plo1?: number
  plo2?: number
  plo3?: number
  plo4?: number
  plo5?: number
  plo6?: number
  plo7?: number
  plo8?: number
  plo9?: number
  plo10?: number
  plo11?: number
  plo12?: number
}

export interface StudentDashboardData {
  student: Student
  program_plos: ProgramPLOs
  recent_courses: RecentCourse[]
  total_courses?: number
}

export interface PLODetail {
  ploNumber: string
  ploTitle: string
  average: number
  courses: Array<{
    course_code: string
    course_title: string
    score: number
    semester: number
  }>
}

export interface CoursePLOData {
  courses: CoursePLO[]
  semesters: number[]
}
