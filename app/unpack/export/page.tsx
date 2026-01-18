'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { StepNavigation } from '@/components/layout'
import { KnowledgeGraphViewer } from '@/components/knowledge-graph/KnowledgeGraphViewer'
import {
  useCourseStore,
  useModuleStore,
  useKnowledgeGraphStore,
  useContextStore,
  useUIStore,
} from '@/stores'
import type { Module, KnowledgeNode, KnowledgeEdge, NodeType } from '@/types/schema'

// Inline SVG icons
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string
  badge?: string
  defaultExpanded?: boolean
  isEmpty?: boolean
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleSection({
  title,
  badge,
  isEmpty,
  expanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {isEmpty && (
            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
              Not configured
            </span>
          )}
          {badge && !isEmpty && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
      </button>
      {expanded && (
        <div className="p-4 border-t border-gray-200">
          {isEmpty ? (
            <p className="text-sm text-gray-400 italic">No data configured</p>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  )
}

// Badge component for tags
function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'bloom' | 'ai' | 'type' | 'external' | 'entry' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    bloom: 'bg-blue-100 text-blue-700',
    ai: 'bg-purple-100 text-purple-700',
    type: 'bg-green-100 text-green-700',
    external: 'bg-amber-100 text-amber-700',
    entry: 'bg-indigo-100 text-indigo-700',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${variants[variant]}`}>
      {children}
    </span>
  )
}

// Helper to check if a node type is external
function isExternalNodeType(type: NodeType): boolean {
  return type === 'external_concept' || type === 'external_skill' || type === 'external_knowledge'
}

// Key-Value row component
function KeyValue({ label, value }: { label: string; value: string | number | undefined | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm py-1">
      <span className="text-gray-500">{label}</span>
      <span className="col-span-2">{value || <span className="text-gray-400 italic">Not set</span>}</span>
    </div>
  )
}

// Expandable Module Card
function ModuleCard({ module, expanded, onToggle }: { module: Module; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <span className="font-medium">{module.sequence}. {module.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {module.bloom_level && <Badge variant="bloom">{module.bloom_level}</Badge>}
          {module.ai_partnership_mode && <Badge variant="ai">{module.ai_partnership_mode}</Badge>}
        </div>
      </button>
      {expanded && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 space-y-3">
          {module.description && (
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Description</span>
              <p className="text-sm mt-1">{module.description}</p>
            </div>
          )}
          {module.learning_outcome && (
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Learning Outcome</span>
              <p className="text-sm mt-1">{module.learning_outcome}</p>
            </div>
          )}
          {module.topics && module.topics.length > 0 && (
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Topics</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {module.topics.map((topic, i) => (
                  <Badge key={i}>{topic}</Badge>
                ))}
              </div>
            </div>
          )}
          {module.estimated_duration && (
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Duration</span>
              <p className="text-sm mt-1">{module.estimated_duration}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Knowledge Node display
function NodeDisplay({ node }: { node: KnowledgeNode }) {
  const isExternal = isExternalNodeType(node.type)
  return (
    <div className={`border rounded p-2 ${isExternal ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <Badge variant={isExternal ? 'external' : 'type'}>{node.type.replace(/_/g, ' ')}</Badge>
        <span className="font-medium text-sm">{node.label}</span>
        {node.is_entry_point && <Badge variant="entry">entry point</Badge>}
      </div>
      {node.description && (
        <p className="text-xs text-gray-600 mb-1">{node.description}</p>
      )}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {node.difficulty && <span>Difficulty: {node.difficulty}</span>}
        {node.bloom_level && <span>Bloom: {node.bloom_level}</span>}
        {node.external_source && (
          <>
            {node.external_source.course_code && (
              <span>From: {node.external_source.course_code}</span>
            )}
            {node.external_source.proficiency_level && (
              <span>Level: {node.external_source.proficiency_level}</span>
            )}
            <span>{node.external_source.required ? 'Required' : 'Recommended'}</span>
          </>
        )}
      </div>
    </div>
  )
}

// Knowledge Edge display
function EdgeDisplay({ edge, nodes }: { edge: KnowledgeEdge; nodes: Map<string, KnowledgeNode> }) {
  const sourceNode = nodes.get(edge.source)
  const targetNode = nodes.get(edge.target)
  return (
    <div className="text-sm py-1 flex items-center gap-2">
      <span className="font-medium">{sourceNode?.label || edge.source}</span>
      <span className="text-gray-400">→</span>
      <Badge>{edge.relationship.replace(/_/g, ' ')}</Badge>
      <span className="text-gray-400">→</span>
      <span className="font-medium">{targetNode?.label || edge.target}</span>
      {edge.strength && <span className="text-xs text-gray-400">({edge.strength})</span>}
    </div>
  )
}

export default function UnpackStep6() {
  const [copied, setCopied] = useState(false)
  const { exportViewMode, setExportViewMode, setCurrentStep } = useUIStore()

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState({
    courseOverview: true,
    learningStructure: true,
    knowledgeGraph: false,
    prerequisites: false,
    contextLearner: false,
    contextAdvanced: false,
  })
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(6)
  }, [setCurrentStep])

  const { course, coreCompetency } = useCourseStore()
  const { modules } = useModuleStore()
  const { nodes, edges, metadata, exportAsPrerequisites, externalNodes } = useKnowledgeGraphStore()
  const { aiPolicy, learnerProfile, teachingApproach, instructorPersona, disciplineConventions, prerequisites } = useContextStore()

  // Check if sections have data (check both context-store and external nodes)
  const hasPrerequisites = (prerequisites.courses?.length || prerequisites.skills?.length || prerequisites.knowledge?.length || externalNodes.size > 0) ?? false
  const hasLearnerProfile = Object.keys(learnerProfile).length > 0
  const hasTeachingApproach = Object.keys(teachingApproach).length > 0
  const hasAIPolicy = Object.keys(aiPolicy).length > 0
  const hasInstructorPersona = Object.keys(instructorPersona).length > 0
  const hasDisciplineConventions = Object.keys(disciplineConventions).length > 0
  const hasContextLearner = hasLearnerProfile || hasTeachingApproach || hasAIPolicy
  const hasContextAdvanced = hasInstructorPersona || hasDisciplineConventions

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  // Build the export document (flexible structure for draft exports)
  const exportDocument = useMemo(() => ({
    schema_version: '0.4',
    exported_at: new Date().toISOString(),
    tool: 'Course Architect',
    course: {
      title: course.title || 'Untitled Course',
      code: course.code,
      institution: course.institution,
      discipline: course.discipline || 'General',
      subdiscipline: course.subdiscipline,
      level: course.level || 'introductory',
      credits: course.credits,
      duration: course.duration,
      delivery_mode: course.delivery_mode,
    },
    core_competency: {
      statement: coreCompetency.statement || '',
      type: coreCompetency.type || 'integrated',
    },
    modules: modules.map((m) => ({
      id: m.id,
      title: m.title,
      sequence: m.sequence,
      description: m.description,
      learning_outcome: m.learning_outcome || '',
      bloom_level: m.bloom_level || 'understand',
      ai_partnership_mode: m.ai_partnership_mode || 'collaborate',
      topics: m.topics || [],
      concept_ids: m.concept_ids,
    })),
    knowledge_graph: {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges.values()),
      metadata: {
        is_dag_valid: metadata.is_dag_valid ?? true,
        node_count: nodes.size,
        edge_count: edges.size,
      },
    },
    context: {
      ai_policy: {
        course_level: aiPolicy.course_level || 'open_use',
        details: aiPolicy.details,
        rationale: aiPolicy.rationale,
        skills_to_develop: aiPolicy.skills_to_develop,
        skills_to_delegate: aiPolicy.skills_to_delegate,
      },
      learner_profile: Object.keys(learnerProfile).length > 0 ? learnerProfile : undefined,
      teaching_approach: Object.keys(teachingApproach).length > 0 ? teachingApproach : undefined,
      instructor_persona: Object.keys(instructorPersona).length > 0 ? instructorPersona : undefined,
      discipline_conventions: Object.keys(disciplineConventions).length > 0 ? disciplineConventions : undefined,
    },
    // Generate prerequisites from external nodes in the graph (for v0.4 backward compatibility)
    // Falls back to context-store prerequisites if no external nodes exist
    prerequisites: (() => {
      const graphPrereqs = exportAsPrerequisites()
      const hasGraphPrereqs = graphPrereqs.courses?.length || graphPrereqs.skills?.length || graphPrereqs.knowledge?.length
      if (hasGraphPrereqs) {
        return graphPrereqs
      }
      return Object.keys(prerequisites).length > 0 ? prerequisites : undefined
    })(),
  }), [course, coreCompetency, modules, nodes, edges, metadata, aiPolicy, learnerProfile, teachingApproach, instructorPersona, disciplineConventions, prerequisites, exportAsPrerequisites])

  const jsonString = JSON.stringify(exportDocument, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${course.code || 'course'}-architect.json`
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review & Export</h1>
        <p className="text-gray-600 mt-1">
          Review your course structure and export as a machine-readable JSON document.
        </p>
      </div>

      {/* Use Cases Card */}
      <Card variant="bordered">
        <CardContent>
          <h3 className="font-medium text-gray-900 mb-3">What can you do with this file?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </span>
                <div>
                  <span className="font-medium">Create a Custom GPT</span>
                  <p className="text-gray-500">Upload as a knowledge file to build an AI tutor that understands your course structure, prerequisites, and teaching style.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </span>
                <div>
                  <span className="font-medium">Power Claude Projects</span>
                  <p className="text-gray-500">Add to a Claude Project to give the AI deep context about your curriculum when helping students or creating materials.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </span>
                <div>
                  <span className="font-medium">Generate Learning Materials</span>
                  <p className="text-gray-500">Use with any AI to create quizzes, study guides, or practice problems that align with your learning outcomes and Bloom&apos;s levels.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
                <div>
                  <span className="font-medium">Track Curriculum Evolution</span>
                  <p className="text-gray-500">Keep versioned exports to document how your course evolves, compare iterations, or share with colleagues.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-primary-600">{modules.length}</div>
            <div className="text-sm text-gray-500">Modules</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-primary-600">
              {modules.filter((m) => m.learning_outcome).length}
            </div>
            <div className="text-sm text-gray-500">Objectives</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-primary-600">{nodes.size}</div>
            <div className="text-sm text-gray-500">Concepts</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-primary-600">{edges.size}</div>
            <div className="text-sm text-gray-500">Relationships</div>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Card variant="bordered">
        <CardContent>
          <Tabs
            defaultValue={exportViewMode}
            onValueChange={(v) => setExportViewMode(v as 'instructor' | 'json' | 'graph')}
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="instructor">Instructor View</TabsTrigger>
                <TabsTrigger value="graph">Graph View</TabsTrigger>
                <TabsTrigger value="json">JSON Output</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy JSON'}
                </Button>
                <Button variant="primary" size="sm" onClick={handleDownload}>
                  Download JSON
                </Button>
              </div>
            </div>

            <TabsContent value="instructor">
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {/* 1. Course Overview */}
                <CollapsibleSection
                  title="Course Overview"
                  expanded={expandedSections.courseOverview}
                  onToggle={() => toggleSection('courseOverview')}
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Course Information</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <KeyValue label="Title" value={course.title} />
                        <KeyValue label="Code" value={course.code} />
                        <KeyValue label="Institution" value={course.institution} />
                        <KeyValue label="Discipline" value={course.discipline} />
                        <KeyValue label="Subdiscipline" value={course.subdiscipline} />
                        <KeyValue label="Level" value={course.level} />
                        <KeyValue label="Credits" value={course.credits} />
                        <KeyValue label="Duration" value={course.duration} />
                        <KeyValue label="Delivery Mode" value={course.delivery_mode?.replace(/_/g, ' ')} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Core Competency</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="italic text-sm">{coreCompetency.statement || <span className="text-gray-400">Not set</span>}</p>
                        <p className="text-xs text-gray-500 mt-2">Type: {coreCompetency.type || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* 2. Learning Structure */}
                <CollapsibleSection
                  title="Learning Structure"
                  badge={`${modules.length} modules`}
                  isEmpty={modules.length === 0}
                  expanded={expandedSections.learningStructure}
                  onToggle={() => toggleSection('learningStructure')}
                >
                  <div className="space-y-2">
                    {modules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        expanded={expandedModules.has(module.id)}
                        onToggle={() => toggleModule(module.id)}
                      />
                    ))}
                  </div>
                </CollapsibleSection>

                {/* 3. Knowledge Graph */}
                <CollapsibleSection
                  title="Knowledge Graph"
                  badge={`${nodes.size} nodes, ${edges.size} edges`}
                  isEmpty={nodes.size === 0}
                  expanded={expandedSections.knowledgeGraph}
                  onToggle={() => toggleSection('knowledgeGraph')}
                >
                  <div className="space-y-4">
                    {/* External Nodes (Prerequisites) */}
                    {externalNodes.size > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-amber-700 mb-2">External Prerequisites ({externalNodes.size})</h4>
                        <p className="text-xs text-gray-500 mb-2">Knowledge assumed from outside this course</p>
                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                          {Array.from(externalNodes.values()).map((node) => (
                            <NodeDisplay key={node.id} node={node} />
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Internal Nodes */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Course Concepts ({nodes.size - externalNodes.size})
                      </h4>
                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                        {Array.from(nodes.values())
                          .filter((node) => !isExternalNodeType(node.type))
                          .map((node) => (
                            <NodeDisplay key={node.id} node={node} />
                          ))}
                      </div>
                    </div>
                    {edges.size > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Edges ({edges.size})</h4>
                        <div className="bg-gray-50 rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-1">
                          {Array.from(edges.values()).map((edge) => (
                            <EdgeDisplay key={edge.id} edge={edge} nodes={nodes} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>

                {/* 4. Prerequisites */}
                <CollapsibleSection
                  title="Prerequisites"
                  isEmpty={!hasPrerequisites}
                  expanded={expandedSections.prerequisites}
                  onToggle={() => toggleSection('prerequisites')}
                >
                  {(() => {
                    // Get prerequisites from external nodes first, fall back to context store
                    const graphPrereqs = exportAsPrerequisites()
                    const displayPrereqs = {
                      courses: graphPrereqs.courses?.length ? graphPrereqs.courses : prerequisites.courses,
                      skills: graphPrereqs.skills?.length ? graphPrereqs.skills : prerequisites.skills,
                      knowledge: graphPrereqs.knowledge?.length ? graphPrereqs.knowledge : prerequisites.knowledge,
                    }
                    return (
                      <div className="space-y-4">
                        {displayPrereqs.courses && displayPrereqs.courses.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Prerequisite Courses</h4>
                            <div className="space-y-2">
                              {displayPrereqs.courses.map((course, i) => (
                                <div key={i} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{course.code}</span>
                                    {course.title && <span className="text-gray-600">- {course.title}</span>}
                                    <Badge>{course.required ? 'Required' : 'Recommended'}</Badge>
                                  </div>
                                  {course.concepts_assumed && course.concepts_assumed.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-xs text-gray-500">Concepts assumed: </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {course.concepts_assumed.map((c, j) => (
                                          <Badge key={j}>{c}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {displayPrereqs.skills && displayPrereqs.skills.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h4>
                            <div className="space-y-2">
                              {displayPrereqs.skills.map((skill, i) => (
                                <div key={i} className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
                                  <span>{skill.skill}</span>
                                  {skill.proficiency_level && <Badge>{skill.proficiency_level}</Badge>}
                                  <Badge>{skill.required ? 'Required' : 'Recommended'}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {displayPrereqs.knowledge && displayPrereqs.knowledge.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Background Knowledge</h4>
                            <div className="space-y-2">
                              {displayPrereqs.knowledge.map((knowledge, i) => (
                                <div key={i} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{knowledge.area}</span>
                                    <Badge>{knowledge.required ? 'Required' : 'Recommended'}</Badge>
                                  </div>
                                  {knowledge.description && (
                                    <p className="text-sm text-gray-600 mt-1">{knowledge.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </CollapsibleSection>

                {/* 5. Context: Learner & Teaching */}
                <CollapsibleSection
                  title="Context: Learner & Teaching"
                  isEmpty={!hasContextLearner}
                  expanded={expandedSections.contextLearner}
                  onToggle={() => toggleSection('contextLearner')}
                >
                  <div className="space-y-4">
                    {hasLearnerProfile && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Learner Profile</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <KeyValue label="Type" value={learnerProfile.type?.replace(/_/g, ' ')} />
                          <KeyValue label="Typical Background" value={learnerProfile.typical_background} />
                          <KeyValue label="Common Challenges" value={learnerProfile.common_challenges} />
                          <KeyValue label="Motivations" value={learnerProfile.motivations} />
                        </div>
                      </div>
                    )}
                    {hasTeachingApproach && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Teaching Approach</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <KeyValue label="Primary" value={teachingApproach.primary?.replace(/_/g, ' ')} />
                          {teachingApproach.secondary && teachingApproach.secondary.length > 0 && (
                            <div className="py-1">
                              <span className="text-sm text-gray-500">Secondary</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {teachingApproach.secondary.map((s, i) => (
                                  <Badge key={i}>{s.replace(/_/g, ' ')}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {teachingApproach.philosophy && (
                            <div className="pt-2">
                              <span className="text-sm text-gray-500">Philosophy</span>
                              <p className="text-sm mt-1">{teachingApproach.philosophy}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {hasAIPolicy && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">AI Policy</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <KeyValue label="Course Level" value={aiPolicy.course_level?.replace(/_/g, ' ')} />
                          {aiPolicy.rationale && (
                            <div className="pt-2">
                              <span className="text-sm text-gray-500">Rationale</span>
                              <p className="text-sm mt-1">{aiPolicy.rationale}</p>
                            </div>
                          )}
                          {aiPolicy.details && (
                            <div className="pt-2">
                              <span className="text-sm text-gray-500">Details</span>
                              <p className="text-sm mt-1">{aiPolicy.details}</p>
                            </div>
                          )}
                          {aiPolicy.skills_to_develop && aiPolicy.skills_to_develop.length > 0 && (
                            <div className="pt-2">
                              <span className="text-sm text-gray-500">Skills to Develop</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {aiPolicy.skills_to_develop.map((s, i) => (
                                  <Badge key={i}>{s}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {aiPolicy.skills_to_delegate && aiPolicy.skills_to_delegate.length > 0 && (
                            <div className="pt-2">
                              <span className="text-sm text-gray-500">Skills to Delegate</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {aiPolicy.skills_to_delegate.map((s, i) => (
                                  <Badge key={i}>{s}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>

                {/* 6. Context: Advanced */}
                <CollapsibleSection
                  title="Context: Advanced"
                  isEmpty={!hasContextAdvanced}
                  expanded={expandedSections.contextAdvanced}
                  onToggle={() => toggleSection('contextAdvanced')}
                >
                  <div className="space-y-4">
                    {hasInstructorPersona && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Instructor Persona</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <KeyValue label="Formality" value={instructorPersona.formality?.replace(/_/g, ' ')} />
                          <KeyValue label="Encouragement Style" value={instructorPersona.encouragement_style?.replace(/_/g, ' ')} />
                          <KeyValue label="Feedback Approach" value={instructorPersona.feedback_approach?.replace(/_/g, ' ')} />
                          {instructorPersona.phrases_to_use && instructorPersona.phrases_to_use.length > 0 && (
                            <div className="pt-2">
                              <span className="text-sm text-gray-500">Phrases to Use</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {instructorPersona.phrases_to_use.map((p, i) => (
                                  <Badge key={i}>{p}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {instructorPersona.phrases_to_avoid && instructorPersona.phrases_to_avoid.length > 0 && (
                            <div className="pt-2">
                              <span className="text-sm text-gray-500">Phrases to Avoid</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {instructorPersona.phrases_to_avoid.map((p, i) => (
                                  <Badge key={i}>{p}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {instructorPersona.cultural_considerations && (
                            <div className="pt-2">
                              <span className="text-sm text-gray-500">Cultural Considerations</span>
                              <p className="text-sm mt-1">{instructorPersona.cultural_considerations}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {hasDisciplineConventions && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Discipline Conventions</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <KeyValue label="Citation Style" value={disciplineConventions.citation_style} />
                          <KeyValue label="Terminology Notes" value={disciplineConventions.terminology_notes} />
                          <KeyValue label="Methodological Conventions" value={disciplineConventions.methodological_conventions} />
                          <KeyValue label="Ethical Considerations" value={disciplineConventions.ethical_considerations} />
                          <KeyValue label="Professional Standards" value={disciplineConventions.professional_standards} />
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              </div>
            </TabsContent>

            <TabsContent value="graph">
              <KnowledgeGraphViewer nodes={nodes} edges={edges} />
            </TabsContent>

            <TabsContent value="json">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto max-h-[600px] text-xs font-mono">
                  {jsonString}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <StepNavigation
        showNext={false}
        backLabel="Back to Context"
      />
    </div>
  )
}
