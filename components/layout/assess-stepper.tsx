'use client'

import { cn } from '@/lib/utils'
import { useUIStore, ASSESS_STEP_LABELS, type AssessStep } from '@/stores'

interface AssessStepperProps {
  className?: string
}

export function AssessStepper({ className }: AssessStepperProps) {
  const { assessCurrentStep, assessStepsCompleted, setAssessCurrentStep } = useUIStore()
  const steps = [1, 2, 3, 4, 5] as AssessStep[]

  const canNavigateTo = (step: AssessStep): boolean => {
    // Can always go to step 1
    if (step === 1) return true
    // Can navigate to a step if all previous steps are completed
    for (let i = 1; i < step; i++) {
      if (!assessStepsCompleted[i as AssessStep]) return false
    }
    return true
  }

  const getStepStatus = (step: AssessStep): 'completed' | 'current' | 'upcoming' => {
    if (step < assessCurrentStep && assessStepsCompleted[step]) return 'completed'
    if (step === assessCurrentStep) return 'current'
    return 'upcoming'
  }

  return (
    <nav className={cn('py-4', className)} aria-label="Assess Progress">
      <ol className="flex items-center justify-between max-w-4xl mx-auto px-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step)
          const canNavigate = canNavigateTo(step)
          const stepInfo = ASSESS_STEP_LABELS[step]

          return (
            <li key={step} className="flex-1 flex items-center">
              {/* Step indicator */}
              <button
                onClick={() => canNavigate && setAssessCurrentStep(step)}
                disabled={!canNavigate}
                className={cn(
                  'flex flex-col items-center group',
                  canNavigate ? 'cursor-pointer' : 'cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                    status === 'completed' &&
                      'bg-accent-600 text-white',
                    status === 'current' &&
                      'bg-accent-600 text-white ring-4 ring-accent-100',
                    status === 'upcoming' &&
                      'bg-gray-100 text-gray-500',
                    canNavigate &&
                      status === 'upcoming' &&
                      'group-hover:bg-gray-200'
                  )}
                >
                  {status === 'completed' ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium hidden sm:block',
                    status === 'current'
                      ? 'text-accent-600'
                      : status === 'completed'
                      ? 'text-gray-700'
                      : 'text-gray-500'
                  )}
                >
                  {stepInfo.title}
                </span>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 sm:mx-4',
                    assessStepsCompleted[step] ? 'bg-accent-600' : 'bg-gray-200'
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
