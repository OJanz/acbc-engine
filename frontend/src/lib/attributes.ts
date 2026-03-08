import { apiFetch } from '@/lib/api'

export interface Level {
  id: string
  attribute_id: string
  label: string
  order: number
  media_type: 'text' | 'image' | 'gif' | null
  media_url: string | null
  created_at: string
  updated_at: string
}

export interface Attribute {
  id: string
  study_id: string
  name: string
  order: number
  type: 'text' | 'image' | 'mixed'
  levels: Level[]
  created_at: string
  updated_at: string
}

export function getAttributes(studyId: string): Promise<Attribute[]> {
  return apiFetch(`/api/v1/studies/${studyId}/attributes`)
}

export function createAttribute(
  studyId: string,
  data: { name: string; order: number; type?: Attribute['type'] },
): Promise<Attribute> {
  return apiFetch(`/api/v1/studies/${studyId}/attributes`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateAttribute(
  studyId: string,
  attributeId: string,
  data: Partial<Pick<Attribute, 'name' | 'order' | 'type'>>,
): Promise<Attribute> {
  return apiFetch(`/api/v1/studies/${studyId}/attributes/${attributeId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteAttribute(studyId: string, attributeId: string): Promise<void> {
  return apiFetch(`/api/v1/studies/${studyId}/attributes/${attributeId}`, {
    method: 'DELETE',
  })
}

export function reorderAttributes(studyId: string, attributeIds: string[]): Promise<void> {
  return apiFetch(`/api/v1/studies/${studyId}/attributes/reorder`, {
    method: 'POST',
    body: JSON.stringify({ attribute_ids: attributeIds }),
  })
}

export function createLevel(
  studyId: string,
  attributeId: string,
  data: { label: string; order: number; media_type?: Level['media_type']; media_url?: string },
): Promise<Level> {
  return apiFetch(`/api/v1/studies/${studyId}/attributes/${attributeId}/levels`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateLevel(
  studyId: string,
  attributeId: string,
  levelId: string,
  data: Partial<Pick<Level, 'label' | 'order' | 'media_type' | 'media_url'>>,
): Promise<Level> {
  return apiFetch(`/api/v1/studies/${studyId}/attributes/${attributeId}/levels/${levelId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteLevel(
  studyId: string,
  attributeId: string,
  levelId: string,
): Promise<void> {
  return apiFetch(`/api/v1/studies/${studyId}/attributes/${attributeId}/levels/${levelId}`, {
    method: 'DELETE',
  })
}

export function reorderLevels(
  studyId: string,
  attributeId: string,
  levelIds: string[],
): Promise<void> {
  return apiFetch(`/api/v1/studies/${studyId}/attributes/${attributeId}/levels/reorder`, {
    method: 'POST',
    body: JSON.stringify({ level_ids: levelIds }),
  })
}
