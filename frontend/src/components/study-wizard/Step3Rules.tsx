import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type Attribute } from '@/lib/attributes'
import { getRules, deleteRule, type Rule } from '@/lib/rules'
import RuleBuilder from './RuleBuilder'

interface Step3RulesProps {
  studyId: string
  attributes: Attribute[]
  onNext: () => void
  onBack: () => void
}

function ruleToSentence(rule: Rule): { ifPart: string; thenPart: string } {
  const ifConds = rule.conditions
    .filter((c) => c.role === 'if')
    .map((c) => `${c.attribute_name} = ${c.level_label}`)
    .join(' UND ')

  const thenConds = rule.conditions
    .filter((c) => c.role === 'then')
    .map((c) => `${c.attribute_name} = ${c.level_label}`)
    .join(' ODER ')

  return { ifPart: ifConds, thenPart: thenConds }
}

export default function Step3Rules({ studyId, attributes, onNext, onBack }: Step3RulesProps) {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)

  useEffect(() => {
    getRules(studyId)
      .then(setRules)
      .catch(() => setError('Regeln konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [studyId])

  function openNew() {
    setEditingRule(null)
    setBuilderOpen(true)
  }

  function openEdit(rule: Rule) {
    setEditingRule(rule)
    setBuilderOpen(true)
  }

  function handleSaved(saved: Rule) {
    setRules((prev) => {
      const exists = prev.find((r) => r.id === saved.id)
      return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [...prev, saved]
    })
    setBuilderOpen(false)
  }

  async function handleDelete(ruleId: string) {
    try {
      await deleteRule(studyId, ruleId)
      setRules((prev) => prev.filter((r) => r.id !== ruleId))
    } catch {
      setError('Regel konnte nicht gelöscht werden.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {rules.length} {rules.length === 1 ? 'Regel' : 'Regeln'}
        </Badge>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Laden…</p>
      )}

      {!loading && rules.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">
          Keine Ausschlussregeln. Klicke unten, um eine Regel hinzuzufügen.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {rules.map((rule) => {
          const { ifPart, thenPart } = ruleToSentence(rule)
          return (
            <div
              key={rule.id}
              className="rounded-lg border bg-card px-4 py-3 flex items-start gap-3"
            >
              <div className="flex-1 text-sm leading-relaxed">
                <span className="font-medium">Wenn</span>{' '}
                <span>{ifPart}</span>
                {', '}
                <span className="font-medium">dann nicht</span>{' '}
                <span>{thenPart}</span>
                {rule.description && (
                  <span className="ml-2 text-muted-foreground italic">
                    „{rule.description}"
                  </span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => openEdit(rule)}
                  aria-label="Bearbeiten"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(rule.id)}
                  aria-label="Löschen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={openNew}
        disabled={attributes.length < 2}
        title={attributes.length < 2 ? 'Mindestens 2 Attribute erforderlich' : undefined}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Regel hinzufügen
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          ← Zurück
        </Button>
        <Button type="button" onClick={onNext}>
          Weiter →
        </Button>
      </div>

      <RuleBuilder
        key={editingRule?.id ?? 'new'}
        open={builderOpen}
        studyId={studyId}
        attributes={attributes}
        rule={editingRule}
        onClose={() => setBuilderOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  )
}
