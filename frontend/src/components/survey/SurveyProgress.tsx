import { cn } from '@/lib/utils'

const PHASES = ['Start', 'Idealprodukt', 'Bewertung', 'Auswahl', 'Abschluss']

interface SurveyProgressProps {
  currentPhase: 1 | 2 | 3 | 4 | 5
}

export default function SurveyProgress({ currentPhase }: SurveyProgressProps) {
  return (
    <nav className="flex items-center gap-0 mb-8">
      {PHASES.map((label, index) => {
        const phase = (index + 1) as 1 | 2 | 3 | 4 | 5
        const isCompleted = phase < currentPhase
        const isActive = phase === currentPhase

        return (
          <div key={phase} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isActive && 'border-primary bg-background text-primary ring-2 ring-primary/30',
                  !isCompleted && !isActive && 'border-muted-foreground/30 bg-background text-muted-foreground',
                )}
              >
                {isCompleted ? '✓' : phase}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isActive && 'text-foreground',
                  !isActive && 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {index < PHASES.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-3 mb-5 transition-colors',
                  phase < currentPhase ? 'bg-primary' : 'bg-muted-foreground/20',
                )}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
