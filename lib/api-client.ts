const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000"

export function apiFetch(input: string, init?: RequestInit) {
  const path = input.startsWith("/") ? input : `/${input}`
  const url = `${API_BASE_URL}${path}`
    // Get token from localStorage
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
    const token = storedUser ? JSON.parse(storedUser)?.token : null
    
    // Merge headers with Authorization
    const headers = new Headers(init?.headers)
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    
    return fetch(url || path, {
      ...init,
      headers,
    })
}

export function getApiUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}` || normalizedPath
}

