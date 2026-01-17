'use client'

import { cn } from '@/lib/utils'
import { useUIStore, type ExtractionProgress } from '@/stores'

const STAGES = [
  { key: 'parsing', label: 'Parsing document' },
  { key: 'metadata', label: 'Extracting course metadata' },
  { key: 'modules', label: 'Structuring modules' },
  { key: 'knowledge-graph', label: 'Building knowledge graph' },
] as const

interface ExtractionProgressProps {
  className?: string
}

export function ExtractionProgressDisplay({ className }: ExtractionProgressProps) {
  const { extractionProgress } = useUIStore()

  if (extractionProgress.stage === 'idle') return null

  const isError = extractionProgress.stage === 'error'
  const isComplete = extractionProgress.stage === 'complete'
  const currentStageIndex = STAGES.findIndex(
    (s) => s.key === extractionProgress.stage
  )

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'bg-white rounded-xl border p-6',
        isError ? 'border-red-200' : 'border-gray-200'
      )}>
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isError ? 'bg-red-100' : isComplete ? 'bg-green-100' : 'bg-primary-100'
          )}>
            {isError ? (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : isComplete ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-primary-600 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
          </div>
          <div>
            <h3 className={cn(
              'font-semibold',
              isError ? 'text-red-900' : 'text-gray-900'
            )}>
              {isError ? 'Extraction failed' : isComplete ? 'Analysis complete' : 'Analyzing your syllabus'}
            </h3>
            <p className={cn(
              'text-sm',
              isError ? 'text-red-600' : 'text-gray-500'
            )}>
              {extractionProgress.message || 'Please wait...'}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${extractionProgress.progress}%` }}
          />
        </div>

        {/* Stage indicators */}
        <div className="space-y-3">
          {STAGES.map((stage, index) => {
            const isComplete = index < currentStageIndex
            const isCurrent = index === currentStageIndex
            const isPending = index > currentStageIndex

            return (
              <div
                key={stage.key}
                className={cn(
                  'flex items-center gap-3 text-sm',
                  isPending && 'opacity-50'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                    isComplete && 'bg-green-100 text-green-700',
                    isCurrent && 'bg-primary-100 text-primary-700',
                    isPending && 'bg-gray-100 text-gray-500'
                  )}
                >
                  {isComplete ? (
                    <svg
                      className="w-4 h-4"
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
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    isComplete && 'text-green-700',
                    isCurrent && 'text-primary-700 font-medium',
                    isPending && 'text-gray-500'
                  )}
                >
                  {stage.label}
                </span>
                {isCurrent && (
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" />
                    <div
                      className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
