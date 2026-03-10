import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Grunddaten' },
  { label: 'Attribute & Levels' },
  { label: 'Ausschlussregeln' },
  { label: 'Design-Parameter' },
]

interface WizardStepperProps {
  currentStep: 1 | 2 | 3 | 4
  onStepClick: (step: 1 | 2 | 3 | 4) => void
}

export default function WizardStepper({ currentStep, onStepClick }: WizardStepperProps) {
  return (
    <nav className="flex items-center gap-0 mb-8">
      {STEPS.map((step, index) => {
        const stepNumber = (index + 1) as 1 | 2 | 3 | 4
        const isCompleted = stepNumber < currentStep
        const isActive = stepNumber === currentStep
        const isClickable = stepNumber !== currentStep

        return (
          <div key={stepNumber} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(stepNumber)}
                disabled={!isClickable}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  isCompleted && 'border-primary bg-primary text-primary-foreground cursor-pointer hover:opacity-80',
                  isActive && 'border-primary bg-background text-primary cursor-default',
                  !isCompleted && !isActive && 'border-muted-foreground/30 bg-background text-muted-foreground cursor-pointer hover:border-muted-foreground/60',
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </button>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isActive && 'text-foreground',
                  !isActive && isClickable && 'text-muted-foreground cursor-pointer',
                  !isActive && !isClickable && 'text-muted-foreground',
                )}
                onClick={() => isClickable && onStepClick(stepNumber)}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-3 mb-5 transition-colors',
                  stepNumber < currentStep ? 'bg-primary' : 'bg-muted-foreground/20',
                )}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
