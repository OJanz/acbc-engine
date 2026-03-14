import { apiFetch } from './api'

export interface SurveyEntry {
  study_id: string
  study_name: string
  welcome_message: string | null
  byo_instruction_title: string | null
  byo_instruction_text: string | null
}

export interface SurveyLevel {
  id: string
  label: string
  order: number
}

export interface SurveyAttribute {
  id: string
  name: string
  order: number
  levels: SurveyLevel[]
}

export const getSurveyEntry = (studyId: string): Promise<SurveyEntry> =>
  apiFetch(`/api/v1/survey/${studyId}`)

export const startSurvey = (studyId: string): Promise<{ participant_id: string }> =>
  apiFetch(`/api/v1/survey/${studyId}/start`, { method: 'POST' })

export const getSurveyAttributes = (studyId: string): Promise<SurveyAttribute[]> =>
  apiFetch(`/api/v1/survey/${studyId}/attributes`)

export const submitByo = (studyId: string, selections: Record<string, string>): Promise<void> =>
  apiFetch(`/api/v1/survey/${studyId}/byo`, {
    method: 'POST',
    body: JSON.stringify({ selections }),
  })
