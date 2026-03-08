import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { type Attribute } from '@/lib/attributes'
import { createRule, updateRule, type Rule, type ConditionIn } from '@/lib/rules'

interface ConditionDraft {
  attribute_id: string
  level_id: string
}

interface RuleBuilderProps {
  open: boolean
  studyId: string
  attributes: Attribute[]
  rule?: Rule | null
  onClose: () => void
  onSaved: (rule: Rule) => void
}

function emptyCondition(): ConditionDraft {
  return { attribute_id: '', level_id: '' }
}

function ruleToIfThenDrafts(
  rule: Rule,
  attributes: Attribute[],
): { ifConds: ConditionDraft[]; thenConds: ConditionDraft[] } {
  const ifConds: ConditionDraft[] = []
  const thenConds: ConditionDraft[] = []
  for (const c of rule.conditions) {
    const attr = attributes.find((a) => a.id === c.attribute_id)
    const draft: ConditionDraft = {
      attribute_id: attr?.id ?? '',
      level_id: c.level_id,
    }
    if (c.role === 'if') ifConds.push(draft)
    else thenConds.push(draft)
  }
  return {
    ifConds: ifConds.length ? ifConds : [emptyCondition()],
    thenConds: thenConds.length ? thenConds : [emptyCondition()],
  }
}

export default function RuleBuilder({
  open,
  studyId,
  attributes,
  rule,
  onClose,
  onSaved,
}: RuleBuilderProps) {
  const initial = rule
    ? ruleToIfThenDrafts(rule, attributes)
    : { ifConds: [emptyCondition()], thenConds: [emptyCondition()] }

  const [ifConds, setIfConds] = useState<ConditionDraft[]>(initial.ifConds)
  const [thenConds, setThenConds] = useState<ConditionDraft[]>(initial.thenConds)
  const [description, setDescription] = useState(rule?.description ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Reset state when sheet opens with a different rule
  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) onClose()
  }

  function updateCond(
    list: ConditionDraft[],
    setList: (v: ConditionDraft[]) => void,
    index: number,
    field: keyof ConditionDraft,
    value: string,
  ) {
    const next = list.map((c, i) =>
      i === index
        ? { ...c, [field]: value, ...(field === 'attribute_id' ? { level_id: '' } : {}) }
        : c,
    )
    setList(next)
  }

  function addCond(list: ConditionDraft[], setList: (v: ConditionDraft[]) => void) {
    setList([...list, emptyCondition()])
  }

  function removeCond(list: ConditionDraft[], setList: (v: ConditionDraft[]) => void, index: number) {
    setList(list.filter((_, i) => i !== index))
  }

  // Attributes already used in this group (other than the current row)
  function usedAttrIds(list: ConditionDraft[], excludeIndex: number): Set<string> {
    return new Set(list.filter((_, i) => i !== excludeIndex).map((c) => c.attribute_id))
  }

  async function handleSave() {
    setError('')
    // Client-side validation
    const allFilled = [...ifConds, ...thenConds].every((c) => c.attribute_id && c.level_id)
    if (!allFilled) {
      setError('Bitte alle Felder ausfüllen.')
      return
    }

    const conditions: ConditionIn[] = [
      ...ifConds.map((c) => ({ role: 'if' as const, level_id: c.level_id })),
      ...thenConds.map((c) => ({ role: 'then' as const, level_id: c.level_id })),
    ]

    setSaving(true)
    try {
      const saved = rule
        ? await updateRule(studyId, rule.id, { description: description || null, conditions })
        : await createRule(studyId, { description: description || null, conditions })
      onSaved(saved)
    } catch {
      setError('Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  function renderConditions(
    label: string,
    list: ConditionDraft[],
    setList: (v: ConditionDraft[]) => void,
    addLabel: string,
    extraDisabledAttrIds: Set<string> = new Set(),
    allowDuplicateAttributes = false,
  ) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {list.map((cond, i) => {
          const used = allowDuplicateAttributes
            ? new Set([...extraDisabledAttrIds])
            : new Set([...usedAttrIds(list, i), ...extraDisabledAttrIds])
          const selectedAttr = attributes.find((a) => a.id === cond.attribute_id)
          const levels = selectedAttr?.levels ?? []

          return (
            <div key={i} className="flex items-center gap-2">
              <Select
                value={cond.attribute_id}
                onValueChange={(v) => updateCond(list, setList, i, 'attribute_id', v)}
              >
                <SelectTrigger className="h-8 flex-1 text-xs bg-blue-50">
                  <SelectValue placeholder="Attribut wählen" />
                </SelectTrigger>
                <SelectContent>
                  {attributes.map((a) => (
                    <SelectItem key={a.id} value={a.id} disabled={used.has(a.id)}>
                      {a.name || '(kein Name)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-xs text-muted-foreground shrink-0">=</span>

              <Select
                value={cond.level_id}
                onValueChange={(v) => updateCond(list, setList, i, 'level_id', v)}
                disabled={!cond.attribute_id}
              >
                <SelectTrigger className="h-8 flex-1 text-xs bg-blue-50">
                  <SelectValue placeholder="Level wählen" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.label || '(kein Label)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {list.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCond(list, setList, i)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  aria-label="Entfernen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )
        })}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start h-7 text-xs px-2"
          onClick={() => addCond(list, setList)}
        >
          <Plus className="h-3 w-3 mr-1" />
          {addLabel}
        </Button>
      </div>
    )
  }

  const ifAttrIds = new Set(ifConds.map((c) => c.attribute_id).filter(Boolean))

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{rule ? 'Regel bearbeiten' : 'Neue Ausschlussregel'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 flex-1">
          {renderConditions(
            'WENN (alle zutreffen)',
            ifConds,
            setIfConds,
            'Weitere Bedingung',
          )}

          <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            … dann darf kein Konzept folgende Level enthalten:
          </div>

          {renderConditions(
            'DANN NICHT',
            thenConds,
            setThenConds,
            'Weiteres Verbot',
            ifAttrIds,
            true,
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rule-desc" className="text-sm">
              Beschreibung <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="rule-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Kaschmir ist nie günstig"
              className="h-8 text-sm"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <SheetFooter className="mt-6 gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Abbrechen
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Speichern…' : 'Speichern'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
