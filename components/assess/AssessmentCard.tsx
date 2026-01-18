'use client'

import { Card, CardContent, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Assessment, AssessmentType, RiskLevel } from '@/types/schema'

interface AssessmentCardProps {
  assessment: Assessment
  isSelected?: boolean
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showVulnerability?: boolean
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

// Risk level display
const RISK_LEVELS: Record<RiskLevel, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low Risk', color: 'text-green-700', bgColor: 'bg-green-100' },
  medium: { label: 'Medium Risk', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  high: { label: 'High Risk', color: 'text-red-700', bgColor: 'bg-red-100' },
}

export function AssessmentCard({
  assessment,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  showVulnerability = false,
}: AssessmentCardProps) {
  const typeInfo = ASSESSMENT_TYPE_INFO[assessment.type] || {
    label: assessment.type,
    color: 'bg-gray-100 text-gray-700',
  }

  const riskInfo = assessment.vulnerability_audit?.risk_level
    ? RISK_LEVELS[assessment.vulnerability_audit.risk_level]
    : null

  return (
    <Card
      variant="bordered"
      className={cn(
        'cursor-pointer transition-all hover:border-accent-300 hover:shadow-sm',
        isSelected && 'border-accent-500 ring-2 ring-accent-200'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-gray-900 truncate">{assessment.name}</h3>
              <span className={cn('text-xs px-2 py-0.5 rounded font-medium', typeInfo.color)}>
                {typeInfo.label}
              </span>
              {assessment.weight > 0 && (
                <span className="text-xs text-gray-500">{assessment.weight}%</span>
              )}
            </div>
            {assessment.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{assessment.description}</p>
            )}
            {assessment.format && (
              <div className="flex flex-wrap gap-2 mt-2">
                {assessment.format.setting && (
                  <Badge variant="secondary" size="sm">
                    {assessment.format.setting.replace(/_/g, ' ')}
                  </Badge>
                )}
                {assessment.format.collaboration && (
                  <Badge variant="secondary" size="sm">
                    {assessment.format.collaboration.replace(/_/g, ' ')}
                  </Badge>
                )}
                {assessment.format.time_constraint && (
                  <Badge variant="secondary" size="sm">
                    {assessment.format.time_constraint}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showVulnerability && riskInfo && (
              <span className={cn('text-xs px-2 py-1 rounded font-medium', riskInfo.bgColor, riskInfo.color)}>
                {riskInfo.label}
              </span>
            )}
            {(onEdit || onDelete) && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
