'use client'

import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useUIStore, STEP_LABELS, type UnpackStep } from '@/stores'

interface StepNavigationProps {
  className?: string
  onNext?: () => void | Promise<void>
  onBack?: () => void
  nextLabel?: string
  backLabel?: string
  nextDisabled?: boolean
  isLoading?: boolean
  showBack?: boolean
  showNext?: boolean
}

export function StepNavigation({
  className,
  onNext,
  onBack,
  nextLabel,
  backLabel = 'Back',
  nextDisabled = false,
  isLoading = false,
  showBack = true,
  showNext = true,
}: StepNavigationProps) {
  const { currentStep, goToNextStep, goToPreviousStep, markStepCompleted } = useUIStore()
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === 6

  const nextStepInfo = currentStep < 6 ? STEP_LABELS[(currentStep + 1) as UnpackStep] : null
  const defaultNextLabel = isLastStep
    ? 'Export'
    : `Continue to ${nextStepInfo?.title}`

  const handleNext = async () => {
    if (onNext) {
      await onNext()
    }
    markStepCompleted(currentStep)
    if (!isLastStep) {
      goToNextStep()
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      goToPreviousStep()
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between pt-6 border-t border-gray-200',
        className
      )}
    >
      <div>
        {showBack && !isFirstStep && (
          <Button variant="outline" onClick={handleBack} disabled={isLoading}>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {backLabel}
          </Button>
        )}
      </div>
      <div>
        {showNext && (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={nextDisabled || isLoading}
            isLoading={isLoading}
          >
            {nextLabel || defaultNextLabel}
            {!isLastStep && (
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
