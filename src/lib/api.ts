import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
})

// ── API helpers ────────────────────────────────────────────────────────────────

export const getDashboardStats = () => api.get("/dashboard/stats").then(r => r.data)

export const getTasks = () => api.get("/tasks").then(r => r.data)
export const createTask = (data: any) => api.post("/tasks", data).then(r => r.data)
export const updateTask = (id: string, data: any) => api.patch(`/tasks/${id}`, data).then(r => r.data)
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`).then(r => r.data)

export const getRisks = () => api.get("/risks").then(r => r.data)
export const resolveRisk = (id: string) => api.post(`/risks/${id}/resolve`).then(r => r.data)
export const rebalanceWorkload = (data: any) => api.post("/risks/rebalance", data).then(r => r.data)

export const getKnowledge = () => api.get("/knowledge").then(r => r.data)
export const searchKnowledge = (q: string) => api.get("/knowledge/search", { params: { q } }).then(r => r.data)

export const askAI = (question: string) => api.post("/ask", { question }).then(r => r.data)

export const getTeam = () => api.get("/team").then(r => r.data)
export const createMember = (data: any) => api.post("/team", data).then(r => r.data)

export const getSprintReport = () => api.get("/reports/sprint").then(r => r.data)

export const seedDemoData = () => api.post("/seed").then(r => r.data)

export const uploadDocument = (file: File, clientId: string, onProgress?: (p: number) => void) => {
  const form = new FormData()
  form.append("file", file)
  form.append("client_id", clientId)
  return api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / (e.total || 1))),
  }).then(r => r.data)
}
