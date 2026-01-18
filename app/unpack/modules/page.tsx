'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Badge, Button, Select, Input, Textarea } from '@/components/ui'
import { StepNavigation } from '@/components/layout'
import { useModuleStore, useUIStore, generateModuleId, useKnowledgeGraphStore, generateNodeId, generateEdgeId } from '@/stores'
import { BLOOM_LEVELS, AI_PARTNERSHIP_MODES, NODE_TYPES, EDGE_RELATIONSHIPS, EDGE_STRENGTHS, type BloomLevel, type AIPartnershipMode, type Module, type KnowledgeNode, type KnowledgeEdge, type NodeType, type NodeDifficulty, type EdgeRelationship, type EdgeStrength } from '@/types/schema'
import { cn } from '@/lib/utils'

// Types for edit state
interface EditingNode {
  id: string
  label: string
  type: NodeType
  description: string
  keywords: string
  ai_notes: string
  parent_module_id: string
  difficulty: NodeDifficulty
}

interface EditingEdge {
  id: string
  source: string
  target: string
  relationship: EdgeRelationship
  strength: EdgeStrength
  rationale: string
}

// Internal node types for filtering (excludes external_* types)
const INTERNAL_NODE_TYPES = NODE_TYPES.filter(t => !t.value.startsWith('external_'))

// Difficulty options
const DIFFICULTY_OPTIONS: { value: NodeDifficulty; label: string }[] = [
  { value: 'foundational', label: 'Foundational' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

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
  const { nodes, edges, metadata, getNodesByModule, addNode, updateNode, removeNode, addEdge, updateEdge, removeEdge } = useKnowledgeGraphStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [conceptsExpanded, setConceptsExpanded] = useState(false)
  const [legendExpanded, setLegendExpanded] = useState(false)

  // CRUD state for concepts
  const [editingNode, setEditingNode] = useState<EditingNode | null>(null)
  const [isAddingNode, setIsAddingNode] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // CRUD state for relationships (edges)
  const [editingEdge, setEditingEdge] = useState<EditingEdge | null>(null)
  const [isAddingEdge, setIsAddingEdge] = useState(false)
  const [deleteEdgeConfirmId, setDeleteEdgeConfirmId] = useState<string | null>(null)

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  // CRUD handlers for concepts
  const handleStartAddNode = (moduleId?: string) => {
    setIsAddingNode(true)
    setEditingNode({
      id: '',
      label: '',
      type: 'concept',
      description: '',
      keywords: '',
      ai_notes: '',
      parent_module_id: moduleId || modules[0]?.id || '',
      difficulty: 'intermediate',
    })
  }

  const handleStartEditNode = (node: KnowledgeNode) => {
    setIsAddingNode(false)
    setEditingNode({
      id: node.id,
      label: node.label,
      type: node.type as NodeType,
      description: node.description || '',
      keywords: (node.keywords || []).join(', '),
      ai_notes: node.ai_notes || '',
      parent_module_id: node.parent_module_id || '',
      difficulty: node.difficulty || 'intermediate',
    })
  }

  const handleSaveNode = () => {
    if (!editingNode || !editingNode.label.trim()) return

    const keywordsArray = editingNode.keywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean)

    if (isAddingNode) {
      // Create new node
      const newNode: KnowledgeNode = {
        id: generateNodeId(editingNode.type),
        type: editingNode.type,
        label: editingNode.label.trim(),
        description: editingNode.description.trim() || undefined,
        keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
        ai_notes: editingNode.ai_notes.trim() || undefined,
        parent_module_id: editingNode.parent_module_id || undefined,
        difficulty: editingNode.difficulty,
        source: 'faculty_defined',
        confirmed: true,
      }
      addNode(newNode)
    } else {
      // Update existing node
      updateNode(editingNode.id, {
        label: editingNode.label.trim(),
        type: editingNode.type,
        description: editingNode.description.trim() || undefined,
        keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
        ai_notes: editingNode.ai_notes.trim() || undefined,
        parent_module_id: editingNode.parent_module_id || undefined,
        difficulty: editingNode.difficulty,
        source: 'faculty_defined',
        confirmed: true,
      })
    }

    setEditingNode(null)
    setIsAddingNode(false)
  }

  const handleCancelEdit = () => {
    setEditingNode(null)
    setIsAddingNode(false)
  }

  const handleDeleteNode = (nodeId: string) => {
    removeNode(nodeId)
    setDeleteConfirmId(null)
  }

  // CRUD handlers for relationships (edges)
  const handleStartAddEdge = () => {
    setIsAddingEdge(true)
    const nodeArray = Array.from(nodes.values())
    setEditingEdge({
      id: '',
      source: nodeArray[0]?.id || '',
      target: nodeArray[1]?.id || nodeArray[0]?.id || '',
      relationship: 'prerequisite_of',
      strength: 'required',
      rationale: '',
    })
  }

  const handleStartEditEdge = (edge: KnowledgeEdge) => {
    setIsAddingEdge(false)
    setEditingEdge({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      relationship: edge.relationship,
      strength: edge.strength || 'required',
      rationale: edge.rationale || '',
    })
  }

  const handleSaveEdge = () => {
    if (!editingEdge || !editingEdge.source || !editingEdge.target) return
    if (editingEdge.source === editingEdge.target) return // Can't connect to self

    if (isAddingEdge) {
      // Create new edge
      const newEdge: KnowledgeEdge = {
        id: generateEdgeId(),
        source: editingEdge.source,
        target: editingEdge.target,
        relationship: editingEdge.relationship,
        strength: editingEdge.strength,
        rationale: editingEdge.rationale.trim() || undefined,
        source_type: 'faculty_defined',
        confirmed: true,
      }
      addEdge(newEdge)
    } else {
      // Update existing edge
      updateEdge(editingEdge.id, {
        source: editingEdge.source,
        target: editingEdge.target,
        relationship: editingEdge.relationship,
        strength: editingEdge.strength,
        rationale: editingEdge.rationale.trim() || undefined,
        source_type: 'faculty_defined',
        confirmed: true,
      })
    }

    setEditingEdge(null)
    setIsAddingEdge(false)
  }

  const handleCancelEditEdge = () => {
    setEditingEdge(null)
    setIsAddingEdge(false)
  }

  const handleDeleteEdge = (edgeId: string) => {
    removeEdge(edgeId)
    setDeleteEdgeConfirmId(null)
  }

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
    router.push('/unpack/assessments')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Structure Modules</h1>
        <p className="text-gray-600 mt-1">
          Review and organize your course into learning modules with outcomes and AI partnership modes.
        </p>
      </div>

      {/* Orientation Card - Bloom's and AI Partnership reference */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
        <div
          className="flex items-start gap-2 cursor-pointer"
          onClick={() => setLegendExpanded(!legendExpanded)}
        >
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-xs font-medium">?</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              Each module has a <span className="font-medium">Bloom&apos;s level</span> (cognitive complexity) and an <span className="font-medium">AI partnership mode</span> (how AI should support learners).
            </p>
          </div>
          <svg
            className={cn(
              'w-4 h-4 text-gray-400 transition-transform flex-shrink-0 mt-0.5',
              legendExpanded && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {legendExpanded && (
          <div className="pl-7 pt-3 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1.5">Bloom&apos;s Taxonomy</p>
              <div className="grid grid-cols-6 gap-2">
                {BLOOM_LEVELS.map((level) => (
                  <div key={level.value} className="text-xs bg-white rounded-lg border border-gray-200 px-2 py-1.5">
                    <p className="font-medium text-gray-700">{level.label}</p>
                    <p className="text-gray-500">{level.verbs.slice(0, 2).join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1.5">AI Partnership Modes</p>
              <div className="grid grid-cols-6 gap-2">
                {AI_PARTNERSHIP_MODES.map((mode) => (
                  <div key={mode.value} className="text-xs bg-white rounded-lg border border-gray-200 px-2 py-1.5">
                    <p className="font-medium text-gray-700">{mode.label}</p>
                    <p className="text-gray-500">{mode.value === 'instruct' ? 'direct answers' : mode.value === 'guide' ? 'Socratic method' : mode.value === 'assist' ? 'help on-demand' : mode.value === 'collaborate' ? 'co-creates' : mode.value === 'audit' ? 'feedback only' : 'observes only'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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

      {/* Extracted Concepts Section */}
      <Card variant="bordered" className="overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => setConceptsExpanded(!conceptsExpanded)}
        >
          <div className="flex items-center gap-3">
            <svg
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform',
                conceptsExpanded && 'rotate-90'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div>
              <h3 className="font-medium text-gray-900">Knowledge Graph</h3>
              <p className="text-sm text-gray-500">
                {nodes.size} concepts, {edges.size} relationships
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {nodes.size > 0 && (
              <Badge variant={metadata.is_dag_valid ? 'success' : 'error'}>
                {metadata.is_dag_valid ? 'Valid DAG' : 'Cycle Detected'}
              </Badge>
            )}
          </div>
        </div>

        {conceptsExpanded && (
          <CardContent className="pt-0 border-t border-gray-100">
            <div className="space-y-4">
              {/* Add Concept Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartAddNode()
                  }}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Concept
                </Button>
              </div>

              {/* Add/Edit Form */}
              {editingNode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-blue-900">
                    {isAddingNode ? 'Add New Concept' : 'Edit Concept'}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700">Label *</label>
                      <Input
                        value={editingNode.label}
                        onChange={(e) => setEditingNode({ ...editingNode, label: e.target.value })}
                        placeholder="Concept name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700">Type</label>
                      <Select
                        value={editingNode.type}
                        onChange={(value) => setEditingNode({ ...editingNode, type: value as NodeType })}
                        options={INTERNAL_NODE_TYPES.map(t => ({ value: t.value, label: t.label }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700">Module</label>
                      <Select
                        value={editingNode.parent_module_id}
                        onChange={(value) => setEditingNode({ ...editingNode, parent_module_id: value })}
                        options={[
                          { value: '', label: 'Unassigned' },
                          ...modules.map(m => ({ value: m.id, label: `${m.sequence}. ${m.title}` }))
                        ]}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700">Difficulty</label>
                      <Select
                        value={editingNode.difficulty}
                        onChange={(value) => setEditingNode({ ...editingNode, difficulty: value as NodeDifficulty })}
                        options={DIFFICULTY_OPTIONS}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700">Description</label>
                    <Textarea
                      value={editingNode.description}
                      onChange={(e) => setEditingNode({ ...editingNode, description: e.target.value })}
                      placeholder="Detailed explanation of this concept"
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700">Keywords (comma-separated)</label>
                    <Input
                      value={editingNode.keywords}
                      onChange={(e) => setEditingNode({ ...editingNode, keywords: e.target.value })}
                      placeholder="synonyms, abbreviations, related terms"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700">AI Notes</label>
                    <Textarea
                      value={editingNode.ai_notes}
                      onChange={(e) => setEditingNode({ ...editingNode, ai_notes: e.target.value })}
                      placeholder="Teaching tips, common difficulties, suggestions for AI tutors"
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveNode}
                      disabled={!editingNode.label.trim()}
                    >
                      {isAddingNode ? 'Add Concept' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Concepts grouped by module */}
              {modules.map((module) => {
                const moduleNodes = getNodesByModule(module.id)
                return (
                  <div key={module.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">
                        Module {module.sequence}: {module.title}
                      </h4>
                      <button
                        onClick={() => handleStartAddNode(module.id)}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        + Add to this module
                      </button>
                    </div>
                    {moduleNodes.length === 0 ? (
                      <p className="pl-4 text-sm text-gray-400 italic">No concepts yet</p>
                    ) : (
                      <div className="pl-4 space-y-2">
                        {moduleNodes.map((node) => (
                          <div
                            key={node.id}
                            className={cn(
                              'flex items-start gap-2 text-sm p-2 rounded-lg -ml-2',
                              editingNode?.id === node.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                            )}
                          >
                            <span className="text-gray-400 mt-0.5">├─</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" size="sm">{node.type.replace(/_/g, ' ')}</Badge>
                                <span className="text-gray-900 font-medium">{node.label}</span>
                                {node.difficulty && (
                                  <span className="text-xs text-gray-400">({node.difficulty})</span>
                                )}
                                {node.confirmed && (
                                  <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              {node.description && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{node.description}</p>
                              )}
                              {node.keywords && node.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {node.keywords.map((kw, i) => (
                                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleStartEditNode(node)}
                                className="p-1 text-gray-400 hover:text-primary-600 rounded"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {deleteConfirmId === node.id ? (
                                <div className="flex items-center gap-1 bg-red-50 rounded px-1">
                                  <button
                                    onClick={() => handleDeleteNode(node.id)}
                                    className="text-xs text-red-600 font-medium px-1 py-0.5"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="text-xs text-gray-500 px-1 py-0.5"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(node.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Unassigned concepts (no parent module) */}
              {(() => {
                const unassignedNodes = Array.from(nodes.values()).filter(
                  (node) => !node.parent_module_id && !node.type.startsWith('external_')
                )
                if (unassignedNodes.length === 0) return null
                return (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 italic">Unassigned Concepts</h4>
                    <div className="pl-4 space-y-2">
                      {unassignedNodes.map((node) => (
                        <div
                          key={node.id}
                          className={cn(
                            'flex items-start gap-2 text-sm p-2 rounded-lg -ml-2',
                            editingNode?.id === node.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                          )}
                        >
                          <span className="text-gray-400 mt-0.5">├─</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" size="sm">{node.type.replace(/_/g, ' ')}</Badge>
                              <span className="text-gray-900 font-medium">{node.label}</span>
                            </div>
                            {node.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{node.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleStartEditNode(node)}
                              className="p-1 text-gray-400 hover:text-primary-600 rounded"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {deleteConfirmId === node.id ? (
                              <div className="flex items-center gap-1 bg-red-50 rounded px-1">
                                <button
                                  onClick={() => handleDeleteNode(node.id)}
                                  className="text-xs text-red-600 font-medium px-1 py-0.5"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="text-xs text-gray-500 px-1 py-0.5"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(node.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Relationships */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    Relationships ({edges.size})
                  </h4>
                  {nodes.size >= 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartAddEdge}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Relationship
                    </Button>
                  )}
                </div>

                {/* Edge Add/Edit Form */}
                {editingEdge && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium text-green-900">
                      {isAddingEdge ? 'Add New Relationship' : 'Edit Relationship'}
                    </h4>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700">From (Source)</label>
                        <Select
                          value={editingEdge.source}
                          onChange={(value) => setEditingEdge({ ...editingEdge, source: value })}
                          options={Array.from(nodes.values()).map(n => ({
                            value: n.id,
                            label: n.label
                          }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Relationship</label>
                        <Select
                          value={editingEdge.relationship}
                          onChange={(value) => setEditingEdge({ ...editingEdge, relationship: value as EdgeRelationship })}
                          options={EDGE_RELATIONSHIPS.map(r => ({ value: r.value, label: r.label }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">To (Target)</label>
                        <Select
                          value={editingEdge.target}
                          onChange={(value) => setEditingEdge({ ...editingEdge, target: value })}
                          options={Array.from(nodes.values())
                            .filter(n => n.id !== editingEdge.source)
                            .map(n => ({ value: n.id, label: n.label }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Strength</label>
                        <Select
                          value={editingEdge.strength}
                          onChange={(value) => setEditingEdge({ ...editingEdge, strength: value as EdgeStrength })}
                          options={EDGE_STRENGTHS}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Rationale (optional)</label>
                        <Input
                          value={editingEdge.rationale}
                          onChange={(e) => setEditingEdge({ ...editingEdge, rationale: e.target.value })}
                          placeholder="Why this relationship exists"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {editingEdge.source === editingEdge.target && (
                      <p className="text-xs text-red-600">Source and target must be different concepts.</p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEditEdge}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveEdge}
                        disabled={!editingEdge.source || !editingEdge.target || editingEdge.source === editingEdge.target}
                      >
                        {isAddingEdge ? 'Add Relationship' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Relationship List */}
                {edges.size > 0 ? (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {Array.from(edges.values()).map((edge) => {
                      const sourceNode = nodes.get(edge.source)
                      const targetNode = nodes.get(edge.target)
                      const relationshipInfo = EDGE_RELATIONSHIPS.find(r => r.value === edge.relationship)
                      return (
                        <div
                          key={edge.id}
                          className={cn(
                            'flex items-center gap-2 text-sm p-2 rounded-lg -ml-2',
                            editingEdge?.id === edge.id ? 'bg-green-50' : 'hover:bg-gray-50'
                          )}
                        >
                          <span className="text-gray-400">•</span>
                          <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
                            <span className="font-medium text-gray-900">{sourceNode?.label || edge.source}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium text-gray-900">{targetNode?.label || edge.target}</span>
                            <Badge variant="secondary" size="sm">{relationshipInfo?.label || edge.relationship.replace(/_/g, ' ')}</Badge>
                            {edge.strength && edge.strength !== 'required' && (
                              <span className="text-xs text-gray-400">({edge.strength})</span>
                            )}
                            {edge.confirmed && (
                              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleStartEditEdge(edge)}
                              className="p-1 text-gray-400 hover:text-primary-600 rounded"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {deleteEdgeConfirmId === edge.id ? (
                              <div className="flex items-center gap-1 bg-red-50 rounded px-1">
                                <button
                                  onClick={() => handleDeleteEdge(edge.id)}
                                  className="text-xs text-red-600 font-medium px-1 py-0.5"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setDeleteEdgeConfirmId(null)}
                                  className="text-xs text-gray-500 px-1 py-0.5"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteEdgeConfirmId(edge.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : nodes.size >= 2 ? (
                  <p className="text-sm text-gray-400 italic py-2">No relationships yet. Click &quot;Add Relationship&quot; to create one.</p>
                ) : nodes.size > 0 ? (
                  <p className="text-sm text-gray-400 italic py-2">Add at least 2 concepts to create relationships.</p>
                ) : null}
              </div>

              {/* Empty state */}
              {nodes.size === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <p className="text-sm">No concepts extracted yet.</p>
                  <p className="text-xs mt-1">Add concepts manually using the button above.</p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <StepNavigation
        onNext={handleSaveAndContinue}
        nextDisabled={modules.length === 0}
      />
    </div>
  )
}
