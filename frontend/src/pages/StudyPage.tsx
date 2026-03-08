import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getStudy, createStudy, updateStudy, type Study } from '@/lib/studies'
import { getAttributes, type Attribute } from '@/lib/attributes'
import WizardStepper from '@/components/study-wizard/WizardStepper'
import Step1BasicInfo from '@/components/study-wizard/Step1BasicInfo'
import Step2Attributes from '@/components/study-wizard/Step2Attributes'
import Step3Rules from '@/components/study-wizard/Step3Rules'
import Step4DesignParams from '@/components/study-wizard/Step4DesignParams'
import ActivateStudyDialog from '@/components/study-wizard/ActivateStudyDialog'

type Step = 1 | 2 | 3 | 4

export default function StudyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isNew = id === 'new'

  const stepParam = Number(searchParams.get('step')) as Step
  const [currentStep, setCurrentStep] = useState<Step>(
    stepParam >= 1 && stepParam <= 4 ? stepParam : 1,
  )

  const [study, setStudy] = useState<Study | null>(null)
  const [studyId, setStudyId] = useState<string | null>(isNew ? null : (id ?? null))
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState('')
  const [showActivateDialog, setShowActivateDialog] = useState(false)

  const canActivate =
    attributes.length >= 2 && attributes.every((a) => a.levels.length >= 2)

  useEffect(() => {
    if (isNew) return
    Promise.all([getStudy(id!), getAttributes(id!)])
      .then(([s, attrs]) => {
        setStudy(s)
        setAttributes(attrs)
      })
      .catch(() => setError('Studie konnte nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [id, isNew])

  function goToStep(step: Step) {
    setCurrentStep(step)
    setSearchParams({ step: String(step) }, { replace: true })
  }

  // Step 1: save basic info
  async function handleStep1Save(data: { name: string; description: string }) {
    setSaving(true)
    setError('')
    try {
      if (isNew) {
        const created = await createStudy({
          name: data.name,
          description: data.description || undefined,
        })
        setStudy(created)
        setStudyId(created.id)
        navigate(`/studies/${created.id}?step=2`, { replace: true })
        setCurrentStep(2)
      } else {
        const updated = await updateStudy(studyId!, {
          name: data.name,
          description: data.description || undefined,
        })
        setStudy(updated)
        goToStep(2)
      }
    } catch {
      setError('Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  // Step 4: save design params
  async function handleStep4Save(data: {
    n_screening_concepts: number
    n_choice_tasks: number
    concepts_per_choice_task: number
  }) {
    setSaving(true)
    setError('')
    try {
      const updated = await updateStudy(studyId!, data)
      setStudy(updated)
    } catch {
      setError('Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  // Activate study
  async function handleActivate() {
    setActivating(true)
    setError('')
    try {
      const updated = await updateStudy(studyId!, { status: 'active' })
      setStudy(updated)
      setShowActivateDialog(false)
      navigate('/studies')
    } catch {
      setError('Aktivierung fehlgeschlagen.')
    } finally {
      setActivating(false)
    }
  }

  if (loading) {
    return <p className="mx-auto max-w-3xl py-8 text-muted-foreground">Laden…</p>
  }

  if (error && !study && !isNew) {
    return <p className="mx-auto max-w-3xl py-8 text-destructive">{error}</p>
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/studies')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Zurück
        </button>
        <h1 className="text-2xl font-semibold">
          {isNew ? 'Neue Studie anlegen' : (study?.name ?? 'Studie bearbeiten')}
        </h1>
      </div>

      <WizardStepper currentStep={currentStep} />

      {currentStep === 1 && (
        <Step1BasicInfo
          defaultValues={{
            name: study?.name ?? '',
            description: study?.description ?? '',
          }}
          onSave={handleStep1Save}
          saving={saving}
          error={error}
        />
      )}

      {currentStep === 2 && studyId && (
        <Step2Attributes
          studyId={studyId}
          initialAttributes={attributes}
          onNext={() => goToStep(3)}
          onBack={() => goToStep(1)}
          onAttributesChange={setAttributes}
        />
      )}

      {currentStep === 3 && studyId && (
        <Step3Rules
          studyId={studyId}
          attributes={attributes}
          onNext={() => goToStep(4)}
          onBack={() => goToStep(2)}
        />
      )}

      {currentStep === 4 && studyId && (
        <Step4DesignParams
          defaultValues={{
            n_screening_concepts: study?.n_screening_concepts ?? 12,
            n_choice_tasks: study?.n_choice_tasks ?? 10,
            concepts_per_choice_task: study?.concepts_per_choice_task ?? 3,
          }}
          onSave={handleStep4Save}
          onBack={() => goToStep(3)}
          onActivate={() => setShowActivateDialog(true)}
          saving={saving}
          activating={activating}
          canActivate={canActivate}
          error={error}
        />
      )}

      <ActivateStudyDialog
        open={showActivateDialog}
        saving={activating}
        onConfirm={handleActivate}
        onCancel={() => setShowActivateDialog(false)}
      />
    </div>
  )
}
