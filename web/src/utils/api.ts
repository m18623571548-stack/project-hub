import axios from 'axios'

const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Module {
  id: string
  name: string
  description: string
  file_count: number
  last_updated: string
  owner: string
  status: string
}

export interface User {
  id: string
  name: string
  role: string
  department: string
  status: string
  last_active: string
}

export interface Task {
  id: string
  title: string
  description: string
  module: string
  assignee: string
  status: string
  priority: string
  progress: number
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  time: string
  user: string
  action: string
  module: string
  detail: string
}

export interface ProjectStats {
  total_modules: number
  total_files: number
  total_users: number
  active_users: number
  total_tasks: number
  pending_tasks: number
  completed_tasks: number
}

export const getStats = () => api.get<ProjectStats>('/stats').then(r => r.data)
export const getModules = () => api.get<{ modules: Module[] }>('/modules').then(r => r.data.modules)
export const getModuleFiles = (id: string) => api.get<{ files: string[] }>(`/modules/${id}/files`).then(r => r.data.files)
export const getUsers = () => api.get<{ users: User[] }>('/users').then(r => r.data.users)
export const getTasks = () => api.get<{ tasks: Task[] }>('/tasks').then(r => r.data.tasks)
export const getActivities = () => api.get<{ activities: Activity[] }>('/activities').then(r => r.data.activities)

export default api
