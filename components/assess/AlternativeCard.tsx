'use client'

import { Card, CardContent, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { AssessmentType, AIPolicyLevel } from '@/types/schema'
import type { AlternativeAssessment } from '@/stores/assessment-store'

interface AlternativeCardProps {
  alternative: AlternativeAssessment
  isAccepted?: boolean
  onAccept?: () => void
  onCustomize?: () => void
  className?: string
}

// Assessment type display info
const ASSESSMENT_TYPE_INFO: Record<AssessmentType, { label: string; color: string }> = {
  written: { label: 'Written', color: 'bg-blue-100 text-blue-700' },
  exam: { label: 'Exam', color: 'bg-purple-100 text-purple-700' },
  problem_set: { label: 'Problem Set', color: 'bg-green-100 text-green-700' },
  project: { label: 'Project', color: 'bg-amber-100 text-amber-700' },
  presentation: { label: 'Presentation', color: 'bg-pink-100 text-pink-700' },
  performance: { label: 'Performance', color: 'bg-red-100 text-red-700' },
  portfolio: { label: 'Portfolio', color: 'bg-indigo-100 text-indigo-700' },
  participation: { label: 'Participation', color: 'bg-gray-100 text-gray-700' },
  peer_review: { label: 'Peer Review', color: 'bg-cyan-100 text-cyan-700' },
  reflection: { label: 'Reflection', color: 'bg-teal-100 text-teal-700' },
}

// AI policy display info
const AI_POLICY_INFO: Record<AIPolicyLevel, { label: string; color: string }> = {
  encouraged: { label: 'AI Encouraged', color: 'bg-green-100 text-green-700' },
  permitted_with_attribution: { label: 'AI Permitted', color: 'bg-blue-100 text-blue-700' },
  restricted: { label: 'AI Restricted', color: 'bg-amber-100 text-amber-700' },
  prohibited: { label: 'No AI', color: 'bg-red-100 text-red-700' },
  required: { label: 'AI Required', color: 'bg-purple-100 text-purple-700' },
  custom: { label: 'Custom Policy', color: 'bg-gray-100 text-gray-700' },
}

export function AlternativeCard({
  alternative,
  isAccepted,
  onAccept,
  onCustomize,
  className,
}: AlternativeCardProps) {
  const typeInfo = ASSESSMENT_TYPE_INFO[alternative.type] || {
    label: alternative.type,
    color: 'bg-gray-100 text-gray-700',
  }

  const policyInfo = alternative.ai_policy
    ? AI_POLICY_INFO[alternative.ai_policy]
    : null

  return (
    <Card
      variant={isAccepted ? 'ai-suggestion' : 'bordered'}
      className={cn(
        'transition-all',
        isAccepted && 'border-green-400 bg-green-50',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-gray-900">{alternative.name}</h3>
                {isAccepted && (
                  <Badge variant="success" size="sm">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Accepted
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-xs px-2 py-0.5 rounded font-medium', typeInfo.color)}>
                  {typeInfo.label}
                </span>
                {policyInfo && (
                  <span className={cn('text-xs px-2 py-0.5 rounded font-medium', policyInfo.color)}>
                    {policyInfo.label}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onCustomize && (
                <Button variant="outline" size="sm" onClick={onCustomize}>
                  Customize
                </Button>
              )}
              {onAccept && !isAccepted && (
                <Button variant="primary" size="sm" onClick={onAccept} className="bg-green-600 hover:bg-green-700">
                  Accept
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700">{alternative.description}</p>

          {/* Authenticity Features */}
          {alternative.authenticity_features && alternative.authenticity_features.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Authenticity Features
              </h4>
              <div className="flex flex-wrap gap-1">
                {alternative.authenticity_features.map((feature, i) => (
                  <Badge key={i} variant="ai" size="sm">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Rationale */}
          {alternative.rationale && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <span className="font-medium text-gray-700">Why this works: </span>
              <span className="text-gray-600">{alternative.rationale}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
