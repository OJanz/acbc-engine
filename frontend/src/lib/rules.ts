import { apiFetch } from '@/lib/api'

export interface RuleCondition {
  id: string
  role: 'if' | 'then'
  level_id: string
  level_label: string
  attribute_id: string
  attribute_name: string
}

export interface Rule {
  id: string
  study_id: string
  description: string | null
  conditions: RuleCondition[]
  created_at: string
  updated_at: string
}

export interface ConditionIn {
  role: 'if' | 'then'
  level_id: string
}

export interface RuleIn {
  description?: string | null
  conditions: ConditionIn[]
}

export async function getRules(studyId: string): Promise<Rule[]> {
  return apiFetch(`/api/v1/studies/${studyId}/rules`)
}

export async function createRule(studyId: string, data: RuleIn): Promise<Rule> {
  return apiFetch(`/api/v1/studies/${studyId}/rules`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateRule(studyId: string, ruleId: string, data: RuleIn): Promise<Rule> {
  return apiFetch(`/api/v1/studies/${studyId}/rules/${ruleId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteRule(studyId: string, ruleId: string): Promise<void> {
  await apiFetch(`/api/v1/studies/${studyId}/rules/${ruleId}`, { method: 'DELETE' })
}
