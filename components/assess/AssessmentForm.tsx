'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Textarea, Select } from '@/components/ui'
import type { Assessment, AssessmentType, AssessmentFormat, AIPolicyLevel, AssessmentSetting, CollaborationType } from '@/types/schema'

interface AssessmentFormProps {
  assessment?: Assessment
  onSave: (assessment: Partial<Assessment>) => void
  onCancel: () => void
  isLoading?: boolean
}

const ASSESSMENT_TYPES: { value: AssessmentType; label: string }[] = [
  { value: 'written', label: 'Written (Essays, Papers)' },
  { value: 'exam', label: 'Exam (Tests, Quizzes)' },
  { value: 'problem_set', label: 'Problem Set' },
  { value: 'project', label: 'Project' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'performance', label: 'Performance (Lab, Demo)' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'participation', label: 'Participation' },
  { value: 'peer_review', label: 'Peer Review' },
  { value: 'reflection', label: 'Reflection' },
]

const ASSESSMENT_SETTINGS: { value: AssessmentSetting; label: string }[] = [
  { value: 'take_home', label: 'Take-home' },
  { value: 'in_class', label: 'In-class' },
  { value: 'synchronous_online', label: 'Synchronous Online' },
  { value: 'asynchronous', label: 'Asynchronous' },
  { value: 'oral', label: 'Oral' },
  { value: 'practical', label: 'Practical' },
]

const COLLABORATION_TYPES: { value: CollaborationType; label: string }[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'pairs', label: 'Pairs' },
  { value: 'small_group', label: 'Small Group' },
  { value: 'class_wide', label: 'Class-wide' },
]

const AI_POLICIES: { value: AIPolicyLevel; label: string }[] = [
  { value: 'encouraged', label: 'Encouraged' },
  { value: 'permitted_with_attribution', label: 'Permitted with Attribution' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'prohibited', label: 'Prohibited' },
  { value: 'required', label: 'Required' },
]

export function AssessmentForm({ assessment, onSave, onCancel, isLoading }: AssessmentFormProps) {
  const [name, setName] = useState(assessment?.name || '')
  const [type, setType] = useState<AssessmentType>(assessment?.type || 'written')
  const [weight, setWeight] = useState(assessment?.weight?.toString() || '0')
  const [description, setDescription] = useState(assessment?.description || '')
  const [setting, setSetting] = useState<AssessmentSetting | ''>(assessment?.format?.setting || '')
  const [timeConstraint, setTimeConstraint] = useState(assessment?.format?.time_constraint || '')
  const [collaboration, setCollaboration] = useState<CollaborationType | ''>(assessment?.format?.collaboration || '')
  const [resourcesAllowed, setResourcesAllowed] = useState(assessment?.format?.resources_allowed || '')
  const [aiPolicy, setAIPolicy] = useState<AIPolicyLevel | ''>(assessment?.ai_policy || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const format: AssessmentFormat = {}
    if (setting) format.setting = setting
    if (timeConstraint) format.time_constraint = timeConstraint
    if (collaboration) format.collaboration = collaboration
    if (resourcesAllowed) format.resources_allowed = resourcesAllowed

    const assessmentData: Partial<Assessment> = {
      name,
      type,
      weight: parseInt(weight) || 0,
      description: description || undefined,
      format: Object.keys(format).length > 0 ? format : undefined,
      ai_policy: aiPolicy || undefined,
    }

    onSave(assessmentData)
  }

  const isValid = name.trim() && type

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assessment Name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Midterm Exam, Research Paper"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <Select
            value={type}
            onChange={(value) => setType(value as AssessmentType)}
            options={ASSESSMENT_TYPES}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (%)
          </label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min="0"
            max="100"
            placeholder="0-100"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What do students do in this assessment?"
            rows={3}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Format Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Setting</label>
            <Select
              value={setting}
              onChange={(value) => setSetting(value as AssessmentSetting)}
              options={[{ value: '', label: 'Select setting...' }, ...ASSESSMENT_SETTINGS]}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Collaboration</label>
            <Select
              value={collaboration}
              onChange={(value) => setCollaboration(value as CollaborationType)}
              options={[{ value: '', label: 'Select collaboration...' }, ...COLLABORATION_TYPES]}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Time Constraint</label>
            <Input
              value={timeConstraint}
              onChange={(e) => setTimeConstraint(e.target.value)}
              placeholder="e.g., 2 hours, 1 week"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Resources Allowed</label>
            <Input
              value={resourcesAllowed}
              onChange={(e) => setResourcesAllowed(e.target.value)}
              placeholder="e.g., Open book, No notes"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">AI Policy</label>
        <Select
          value={aiPolicy}
          onChange={(value) => setAIPolicy(value as AIPolicyLevel)}
          options={[{ value: '', label: 'Select AI policy...' }, ...AI_POLICIES]}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!isValid || isLoading} isLoading={isLoading}>
          {assessment ? 'Save Changes' : 'Add Assessment'}
        </Button>
      </div>
    </form>
  )
}
