/**
 * PLO Attainments API – base URL for /api/plo-attainments.
 * Default: http://localhost:3000/api/plo-attainments
 * Override with NEXT_PUBLIC_PLO_ATTAINMENTS_API_URL, or set NEXT_PUBLIC_API_URL for host only.
 */
const _host = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, "")
const PLO_ATTAINMENTS_BASE =
  process.env.NEXT_PUBLIC_PLO_ATTAINMENTS_API_URL || `${_host}/api/plo-attainments`

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {}
  try {
    const stored = localStorage.getItem("user")
    const data = stored ? JSON.parse(stored) : null
    const token = data?.access_token ?? data?.token ?? null
    if (token) return { Authorization: `Bearer ${token}` }
  } catch {
    /* ignore */
  }
  return {}
}

async function ploFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = path.startsWith("/") ? `${PLO_ATTAINMENTS_BASE}${path}` : `${PLO_ATTAINMENTS_BASE}/${path}`
  return fetch(url, {
    ...init,
    headers: { ...getAuthHeaders(), ...(init?.headers as HeadersInit) },
  })
}

export interface BatchWithPLOData {
  batch_id: number
  batch_name: string
  batch_year: number
  program_name: string
  student_count: number
}

export interface PLOAttainment {
  plo_number: number
  average_attainment: number
  course_count: number
  is_achieved: boolean
  achievement_level: "High" | "Medium" | "Low"
  contributing_courses: Array<{
    course_code: string
    attainment: number
  }>
}

export interface StudentPLOData {
  student_id: number
  roll_no: string
  student_name: string
  plo_attainments: PLOAttainment[]
  overall_achievement: {
    total_plos: number
    achieved_plos: number
    achievement_percentage: number
  }
}

export interface BatchPLOResponse {
  batch: {
    id: number
    name: string
    year: number
    program_name: string
  }
  students: StudentPLOData[]
}

export interface StudentPLODetailResponse {
  student: {
    student_id: number
    roll_no: string
    student_name: string
    batch_id?: number
    batch_name?: string
    program_name?: string
  }
  plo_attainments: PLOAttainment[]
  summary: {
    total_plos: number
    achieved_plos: number
    achievement_percentage: number
  }
}

/**
 * Fetch all batches with PLO attainment data
 * GET /api/plo-attainments/batches
 */
export async function getBatchesWithPLOData(): Promise<BatchWithPLOData[]> {
  const res = await ploFetch("/batches")
  if (!res.ok) {
    if (res.status === 404) throw new Error("Batches endpoint not found")
    throw new Error("Failed to fetch batches")
  }
  return res.json()
}

/**
 * Fetch students with PLO attainments for a specific batch
 * GET /api/plo-attainments/batch/:batchId
 * Uses numeric batchId as expected by backend.
 */
export async function getBatchPLOAttainments(batchId: number): Promise<BatchPLOResponse> {
  const id = Number(batchId)
  if (!Number.isInteger(id) || id < 1) {
    throw new Error("Invalid batch id")
  }
  const res = await ploFetch(`/batch/${id}`)
  if (!res.ok) {
    if (res.status === 404) throw new Error("Batch not found")
    throw new Error("Failed to fetch batch PLO attainments")
  }
  const data = await res.json()
  if (!data || typeof data !== "object") {
    throw new Error("Invalid batch response")
  }
  return {
    batch: data.batch ?? {
      id: data.batch_id ?? id,
      name: data.batch_name ?? data.name ?? `Batch ${id}`,
      year: data.batch_year ?? data.year ?? null,
      program_name: data.program_name ?? "",
    },
    students: Array.isArray(data.students) ? data.students : [],
  }
}

/**
 * Fetch a single student's PLO details
 * GET /api/plo-attainments/student/:studentId
 * Response: { student, plo_attainments, summary }
 */
export async function getStudentPLODetail(studentId: number): Promise<StudentPLODetailResponse> {
  const id = Number(studentId)
  if (!Number.isInteger(id) || id < 1) {
    throw new Error("Invalid student id")
  }
  const res = await ploFetch(`/student/${id}`)
  if (!res.ok) {
    if (res.status === 404) throw new Error("Student not found")
    throw new Error("Failed to fetch student PLO details")
  }
  const data = await res.json()
  if (!data || typeof data !== "object") {
    throw new Error("Invalid student response")
  }
  return {
    student: data.student ?? {
      student_id: id,
      roll_no: data.roll_no ?? "",
      student_name: data.student_name ?? data.name ?? "",
      batch_id: data.batch_id,
      batch_name: data.batch_name,
      program_name: data.program_name,
    },
    plo_attainments: Array.isArray(data.plo_attainments) ? data.plo_attainments : [],
    summary: data.summary ?? {
      total_plos: 12,
      achieved_plos: 0,
      achievement_percentage: 0,
    },
  }
}
