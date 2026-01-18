'use client'

import { useState } from 'react'
import { Card, CardContent, Button, Input, Textarea, Select, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Rubric, RubricCriterion, RubricLevel, RubricCategory } from '@/types/schema'
import { RUBRIC_CATEGORIES, DEFAULT_RUBRIC_LEVELS } from '@/stores/rubric-store'

interface RubricEditorProps {
  rubric: Rubric
  onUpdateCriterion: (index: number, updates: Partial<RubricCriterion>) => void
  onAddCriterion: (criterion: RubricCriterion) => void
  onRemoveCriterion: (index: number) => void
  onUpdateLevel: (criterionIndex: number, levelIndex: number, updates: Partial<RubricLevel>) => void
  isReadOnly?: boolean
}

// Category colors
const CATEGORY_COLORS: Record<RubricCategory, string> = {
  content_mastery: 'bg-blue-100 text-blue-700 border-blue-200',
  process_quality: 'bg-purple-100 text-purple-700 border-purple-200',
  metacognition: 'bg-green-100 text-green-700 border-green-200',
  ai_collaboration: 'bg-amber-100 text-amber-700 border-amber-200',
  authentic_voice: 'bg-pink-100 text-pink-700 border-pink-200',
  contextual_application: 'bg-teal-100 text-teal-700 border-teal-200',
}

interface CriterionEditorProps {
  criterion: RubricCriterion
  index: number
  onUpdate: (updates: Partial<RubricCriterion>) => void
  onUpdateLevel: (levelIndex: number, updates: Partial<RubricLevel>) => void
  onRemove: () => void
  isReadOnly?: boolean
  isExpanded: boolean
  onToggle: () => void
}

function CriterionEditor({
  criterion,
  index,
  onUpdate,
  onUpdateLevel,
  onRemove,
  isReadOnly,
  isExpanded,
  onToggle,
}: CriterionEditorProps) {
  const categoryInfo = RUBRIC_CATEGORIES.find((c) => c.value === criterion.category)
  const categoryColor = criterion.category ? CATEGORY_COLORS[criterion.category] : 'bg-gray-100 text-gray-700'

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <button className="text-gray-400">
            {isExpanded ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{criterion.name || `Criterion ${index + 1}`}</span>
              <span className="text-sm text-gray-500">{criterion.weight}%</span>
            </div>
            {criterion.category && (
              <span className={cn('text-xs px-2 py-0.5 rounded', categoryColor)}>
                {categoryInfo?.label || criterion.category}
              </span>
            )}
          </div>
        </div>
        {!isReadOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Criterion Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <Input
                value={criterion.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                disabled={isReadOnly}
                placeholder="Criterion name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Weight (%)</label>
              <Input
                type="number"
                value={criterion.weight}
                onChange={(e) => onUpdate({ weight: parseInt(e.target.value) || 0 })}
                disabled={isReadOnly}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <Select
                value={criterion.category || ''}
                onChange={(value) => onUpdate({ category: value as RubricCategory || undefined })}
                disabled={isReadOnly}
                options={[
                  { value: '', label: 'Select category...' },
                  ...RUBRIC_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
                ]}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <Input
                value={criterion.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value || undefined })}
                disabled={isReadOnly}
                placeholder="What this criterion evaluates"
              />
            </div>
          </div>

          {/* Levels Table */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Performance Levels</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 w-24">Level</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 w-16">Pts</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {criterion.levels.map((level, levelIndex) => (
                    <tr key={levelIndex}>
                      <td className="px-3 py-2">
                        <Input
                          value={level.name}
                          onChange={(e) => onUpdateLevel(levelIndex, { name: e.target.value })}
                          disabled={isReadOnly}
                          className="text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          value={level.points}
                          onChange={(e) => onUpdateLevel(levelIndex, { points: parseInt(e.target.value) || 0 })}
                          disabled={isReadOnly}
                          className="text-sm w-16"
                          min="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Textarea
                          value={level.description}
                          onChange={(e) => onUpdateLevel(levelIndex, { description: e.target.value })}
                          disabled={isReadOnly}
                          className="text-sm"
                          rows={2}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function RubricEditor({
  rubric,
  onUpdateCriterion,
  onAddCriterion,
  onRemoveCriterion,
  onUpdateLevel,
  isReadOnly,
}: RubricEditorProps) {
  const [expandedCriteria, setExpandedCriteria] = useState<Set<number>>(new Set([0]))

  const toggleCriterion = (index: number) => {
    setExpandedCriteria((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const handleAddCriterion = () => {
    const newCriterion: RubricCriterion = {
      name: '',
      weight: 0,
      levels: [...DEFAULT_RUBRIC_LEVELS],
    }
    onAddCriterion(newCriterion)
    setExpandedCriteria((prev) => new Set([...prev, rubric.criteria.length]))
  }

  // Calculate total weight
  const totalWeight = rubric.criteria.reduce((sum, c) => sum + c.weight, 0)

  return (
    <div className="space-y-4">
      {/* Weight Summary */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          {rubric.criteria.length} {rubric.criteria.length === 1 ? 'criterion' : 'criteria'}
        </div>
        <div className={cn('font-medium', totalWeight === 100 ? 'text-green-600' : 'text-amber-600')}>
          Total Weight: {totalWeight}%
          {totalWeight !== 100 && (
            <span className="text-xs ml-2">({totalWeight < 100 ? `${100 - totalWeight}% remaining` : `${totalWeight - 100}% over`})</span>
          )}
        </div>
      </div>

      {/* Criteria List */}
      <div className="space-y-3">
        {rubric.criteria.map((criterion, index) => (
          <CriterionEditor
            key={index}
            criterion={criterion}
            index={index}
            onUpdate={(updates) => onUpdateCriterion(index, updates)}
            onUpdateLevel={(levelIndex, updates) => onUpdateLevel(index, levelIndex, updates)}
            onRemove={() => onRemoveCriterion(index)}
            isReadOnly={isReadOnly}
            isExpanded={expandedCriteria.has(index)}
            onToggle={() => toggleCriterion(index)}
          />
        ))}
      </div>

      {/* Add Criterion Button */}
      {!isReadOnly && (
        <Button variant="outline" onClick={handleAddCriterion} className="w-full">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Criterion
        </Button>
      )}
    </div>
  )
}
