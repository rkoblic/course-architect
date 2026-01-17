'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Badge, Button, Select, Input, Textarea } from '@/components/ui'
import { StepNavigation } from '@/components/layout'
import { useModuleStore, useUIStore, generateModuleId } from '@/stores'
import { BLOOM_LEVELS, AI_PARTNERSHIP_MODES, type BloomLevel, type AIPartnershipMode, type Module } from '@/types/schema'
import { cn } from '@/lib/utils'

function ModuleCard({
  module,
  onUpdate,
  onRemove,
  isExpanded,
  onToggleExpand,
}: {
  module: Module
  onUpdate: (updates: Partial<Module>) => void
  onRemove: () => void
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const bloomInfo = BLOOM_LEVELS.find((b) => b.value === module.bloom_level)
  const aiModeInfo = AI_PARTNERSHIP_MODES.find((m) => m.value === module.ai_partnership_mode)

  return (
    <Card variant="bordered" className="overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-semibold">
            {module.sequence}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{module.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="primary" size="sm">{bloomInfo?.label || module.bloom_level}</Badge>
              <Badge variant="secondary" size="sm">{aiModeInfo?.label || module.ai_partnership_mode}</Badge>
            </div>
          </div>
        </div>
        <svg
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded && (
        <CardContent className="pt-0 border-t border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input
                value={module.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Learning Outcome</label>
              <Textarea
                value={module.learning_outcome}
                onChange={(e) => onUpdate({ learning_outcome: e.target.value })}
                className="mt-1"
                rows={2}
                placeholder="What will learners be able to do after this module?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Bloom&apos;s Level</label>
                <Select
                  value={module.bloom_level}
                  onChange={(value) => onUpdate({ bloom_level: value as BloomLevel })}
                  options={BLOOM_LEVELS.map((b) => ({ value: b.value, label: b.label }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">AI Partnership Mode</label>
                <Select
                  value={module.ai_partnership_mode}
                  onChange={(value) => onUpdate({ ai_partnership_mode: value as AIPartnershipMode })}
                  options={AI_PARTNERSHIP_MODES.map((m) => ({ value: m.value, label: m.label }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Topics</label>
              <Input
                value={(module.topics || []).join(', ')}
                onChange={(e) =>
                  onUpdate({
                    topics: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })
                }
                className="mt-1"
                placeholder="Comma-separated list of topics"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Estimated Duration</label>
              <Input
                value={module.estimated_duration || ''}
                onChange={(e) => onUpdate({ estimated_duration: e.target.value })}
                className="mt-1"
                placeholder="e.g., 2 weeks, 3 class sessions"
              />
            </div>

            <div className="flex justify-end">
              <Button variant="destructive" size="sm" onClick={onRemove}>
                Remove Module
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function UnpackStep3() {
  const router = useRouter()
  const { modules, updateModule, removeModule, addModule, reorderModules } = useModuleStore()
  const { markStepCompleted, setCurrentStep } = useUIStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleAddModule = () => {
    const newModule: Module = {
      id: generateModuleId(),
      sequence: modules.length + 1,
      title: `Module ${modules.length + 1}`,
      learning_outcome: '',
      bloom_level: 'understand',
      ai_partnership_mode: 'guide',
      topics: [],
    }
    addModule(newModule)
    setExpandedId(newModule.id)
  }

  const handleSaveAndContinue = () => {
    markStepCompleted(3)
    setCurrentStep(4)
    router.push('/unpack/prerequisites')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Structure Modules</h1>
        <p className="text-gray-600 mt-1">
          Review and organize your course into learning modules with outcomes and AI partnership modes.
        </p>
      </div>

      {/* Module List */}
      <div className="space-y-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onUpdate={(updates) => updateModule(module.id, updates)}
            onRemove={() => removeModule(module.id)}
            isExpanded={expandedId === module.id}
            onToggleExpand={() => setExpandedId(expandedId === module.id ? null : module.id)}
          />
        ))}
      </div>

      <Button variant="outline" onClick={handleAddModule} className="w-full">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Module
      </Button>

      {/* Legend */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
          <svg
            className="w-4 h-4 transform transition-transform group-open:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Understanding Bloom&apos;s Levels and AI Partnership Modes
        </summary>
        <div className="mt-3 pl-6 space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Bloom&apos;s Taxonomy</h4>
            <div className="grid grid-cols-3 gap-2">
              {BLOOM_LEVELS.map((level) => (
                <div key={level.value} className="bg-gray-50 rounded p-2">
                  <p className="font-medium text-sm">{level.label}</p>
                  <p className="text-xs text-gray-500">{level.verbs.slice(0, 3).join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">AI Partnership Modes</h4>
            <div className="grid grid-cols-2 gap-2">
              {AI_PARTNERSHIP_MODES.map((mode) => (
                <div key={mode.value} className="bg-gray-50 rounded p-2">
                  <p className="font-medium text-sm">{mode.label}</p>
                  <p className="text-xs text-gray-500">{mode.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </details>

      <StepNavigation
        onNext={handleSaveAndContinue}
        nextDisabled={modules.length === 0}
      />
    </div>
  )
}
