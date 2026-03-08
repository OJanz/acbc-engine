import { apiFetch } from '@/lib/api'

export interface Study {
  id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'closed'
  n_screening_concepts: number
  n_choice_tasks: number
  concepts_per_choice_task: number
  created_at: string
  updated_at: string
}

export function getStudies(): Promise<Study[]> {
  return apiFetch('/api/v1/studies/')
}

export function getStudy(id: string): Promise<Study> {
  return apiFetch(`/api/v1/studies/${id}`)
}

export function createStudy(data: { name: string; description?: string }): Promise<Study> {
  return apiFetch('/api/v1/studies/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateStudy(id: string, data: Partial<Pick<Study, 'name' | 'description' | 'status' | 'n_screening_concepts' | 'n_choice_tasks' | 'concepts_per_choice_task'>>): Promise<Study> {
  return apiFetch(`/api/v1/studies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}
