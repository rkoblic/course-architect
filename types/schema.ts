// Course Architect Schema v0.4 - TypeScript Types

export type CourseLevel = 'introductory' | 'intermediate' | 'advanced' | 'graduate' | 'professional'

export type DeliveryMode = 'in_person' | 'online_synchronous' | 'online_asynchronous' | 'hybrid' | 'hyflex'

export type CompetencyType = 'knowledge' | 'skill' | 'integrated' | 'disposition'

export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'

export type AIPartnershipMode = 'instruct' | 'guide' | 'assist' | 'collaborate' | 'audit' | 'witness'

export type NodeType = 'concept' | 'skill' | 'competency' | 'threshold_concept' | 'misconception'

export type EdgeRelationship =
  | 'prerequisite_of'
  | 'builds_on'
  | 'part_of'
  | 'related_to'
  | 'contrasts_with'
  | 'applies_to'
  | 'example_of'
  | 'requires_skill'
  | 'develops_skill'
  | 'addresses_misconception'

export type EdgeStrength = 'required' | 'recommended' | 'optional'

export type NodeDifficulty = 'foundational' | 'intermediate' | 'advanced'

export type SourceType = 'ai_extracted' | 'faculty_defined' | 'imported'

export type ExtractionMethod = 'ai_extracted' | 'faculty_defined' | 'ai_with_faculty_review' | 'imported'

export type AssessmentType =
  | 'written'
  | 'exam'
  | 'problem_set'
  | 'project'
  | 'presentation'
  | 'performance'
  | 'portfolio'
  | 'participation'
  | 'peer_review'
  | 'reflection'

export type AIPolicyLevel = 'encouraged' | 'permitted_with_attribution' | 'restricted' | 'prohibited' | 'custom' | 'required'

export type RiskLevel = 'low' | 'medium' | 'high'

export type LearnerProfileType =
  | 'traditional_undergraduate'
  | 'adult_learner'
  | 'graduate'
  | 'professional'
  | 'career_changer'
  | 'mixed'

export type TeachingApproach =
  | 'lecture'
  | 'discussion'
  | 'problem_based'
  | 'project_based'
  | 'studio'
  | 'flipped'
  | 'case_based'
  | 'inquiry'
  | 'hybrid'

export type Formality = 'casual' | 'conversational' | 'professional' | 'formal'

export type EncouragementStyle = 'warm_supportive' | 'matter_of_fact' | 'challenging' | 'socratic'

export type FeedbackApproach = 'strengths_first' | 'direct' | 'balanced' | 'questioning'

export type RubricCategory =
  | 'content_mastery'
  | 'process_quality'
  | 'metacognition'
  | 'ai_collaboration'
  | 'authentic_voice'
  | 'contextual_application'

export type AssessmentSetting =
  | 'take_home'
  | 'in_class'
  | 'synchronous_online'
  | 'asynchronous'
  | 'oral'
  | 'practical'

export type CollaborationType = 'individual' | 'pairs' | 'small_group' | 'class_wide'

export type ProficiencyLevel = 'basic' | 'intermediate' | 'advanced'

export type ExternalFramework = 'CTDL-ASN' | 'CASE' | 'ESCO' | 'ONET' | 'custom'

// External Alignment
export interface ExternalAlignment {
  framework: ExternalFramework
  framework_name?: string
  uri?: string
  code?: string
  label?: string
}

// LRMI Alignment
export interface LRMIAlignment {
  '@type': 'Course'
  educationalLevel?: string
  teaches?: string[]
  assesses?: string[]
}

// Course Metadata
export interface Course {
  id?: string
  title: string
  code?: string
  institution?: string
  discipline: string
  subdiscipline?: string
  level: CourseLevel
  credits?: number
  duration?: string
  delivery_mode?: DeliveryMode
  lrmi_alignment?: LRMIAlignment
}

// Core Competency
export interface CoreCompetency {
  id?: string
  statement: string
  type: CompetencyType
  external_alignment?: ExternalAlignment[]
}

// Module
export interface Module {
  id: string
  sequence: number
  title: string
  description?: string
  learning_outcome: string
  bloom_level: BloomLevel
  ai_partnership_mode: AIPartnershipMode
  topics?: string[]
  estimated_duration?: string
  concept_ids?: string[]
  assessment_ids?: string[]
}

// Knowledge Graph Node
export interface KnowledgeNode {
  id: string
  type: NodeType
  label: string
  description?: string
  bloom_level?: BloomLevel
  difficulty?: NodeDifficulty
  parent_module_id?: string
  keywords?: string[]
  external_alignments?: ExternalAlignment[]
  ai_notes?: string
  common_misconceptions?: string[]
  source?: SourceType
  confirmed?: boolean
}

// Knowledge Graph Edge
export interface KnowledgeEdge {
  id: string
  source: string
  target: string
  relationship: EdgeRelationship
  strength?: EdgeStrength
  confidence?: number
  rationale?: string
  source_type?: SourceType
  confirmed?: boolean
}

// Knowledge Graph Metadata
export interface KnowledgeGraphMetadata {
  extraction_method: ExtractionMethod
  last_validated?: string
  node_count?: number
  edge_count?: number
  is_dag_valid: boolean
}

// Knowledge Graph
export interface KnowledgeGraph {
  metadata: KnowledgeGraphMetadata
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

// Assessment Format
export interface AssessmentFormat {
  setting?: AssessmentSetting
  time_constraint?: string
  collaboration?: CollaborationType
  resources_allowed?: string
}

// Vulnerability Dimensions
export interface VulnerabilityDimensions {
  reproducibility?: RiskLevel
  verification?: RiskLevel
  uniqueness?: RiskLevel
  temporal?: RiskLevel
  embodied?: RiskLevel
}

// Vulnerability Audit
export interface VulnerabilityAudit {
  risk_level: RiskLevel
  dimensions?: VulnerabilityDimensions
  rationale?: string
  audited_at?: string
}

// Assessment
export interface Assessment {
  id: string
  name: string
  type: AssessmentType
  weight: number
  description?: string
  module_ids?: string[]
  concept_ids?: string[]
  format?: AssessmentFormat
  ai_policy?: AIPolicyLevel
  ai_policy_details?: string
  vulnerability_audit?: VulnerabilityAudit
  authenticity_features?: string[]
  rubric_id?: string
}

// Rubric Level
export interface RubricLevel {
  name: string
  points: number
  description: string
}

// Rubric Criterion
export interface RubricCriterion {
  name: string
  description?: string
  weight: number
  category?: RubricCategory
  concept_ids?: string[]
  levels: RubricLevel[]
}

// Rubric
export interface Rubric {
  id: string
  assessment_id: string
  criteria: RubricCriterion[]
}

// Prerequisites - Course
export interface PrerequisiteCourse {
  code: string
  title?: string
  required: boolean
  concepts_assumed?: string[]
}

// Prerequisites - Skill
export interface PrerequisiteSkill {
  skill: string
  proficiency_level?: ProficiencyLevel
  required: boolean
}

// Prerequisites - Knowledge
export interface PrerequisiteKnowledge {
  area: string
  description?: string
  required: boolean
}

// Prerequisites
export interface Prerequisites {
  courses?: PrerequisiteCourse[]
  skills?: PrerequisiteSkill[]
  knowledge?: PrerequisiteKnowledge[]
}

// AI Policy
export interface AIPolicy {
  course_level: AIPolicyLevel
  rationale?: string
  details?: string
  skills_to_develop?: string[]
  skills_to_delegate?: string[]
}

// Learner Profile
export interface LearnerProfile {
  type?: LearnerProfileType
  typical_background?: string
  common_challenges?: string
  motivations?: string
}

// Teaching Approach Context
export interface TeachingApproachContext {
  primary?: TeachingApproach
  secondary?: string[]
  philosophy?: string
}

// Instructor Persona
export interface InstructorPersona {
  formality?: Formality
  encouragement_style?: EncouragementStyle
  feedback_approach?: FeedbackApproach
  phrases_to_use?: string[]
  phrases_to_avoid?: string[]
  cultural_considerations?: string
}

// Discipline Conventions
export interface DisciplineConventions {
  citation_style?: string
  terminology_notes?: string
  methodological_conventions?: string
  ethical_considerations?: string
  professional_standards?: string
}

// Context
export interface Context {
  ai_policy: AIPolicy
  learner_profile?: LearnerProfile
  teaching_approach?: TeachingApproachContext
  instructor_persona?: InstructorPersona
  discipline_conventions?: DisciplineConventions
}

// Learning Path Step
export interface LearningPathStep {
  node_id: string
  optional?: boolean
  notes?: string
}

// Learning Path
export interface LearningPath {
  id: string
  name: string
  description?: string
  target_audience?: string
  sequence: LearningPathStep[]
}

// AI System Prompt
export interface AISystemPrompt {
  full_prompt?: string
  context_summary?: string
  module_prompts?: Record<string, string>
}

// Complete Course Architect Document
export interface CourseArchitectDocument {
  schema_version: '0.4'
  exported_at: string
  tool: 'Course Architect'
  course: Course
  core_competency: CoreCompetency
  modules: Module[]
  knowledge_graph: KnowledgeGraph
  assessments?: Assessment[]
  rubrics?: Rubric[]
  prerequisites?: Prerequisites
  context: Context
  learning_paths?: LearningPath[]
  ai_system_prompt?: AISystemPrompt
}

// Helper type for partial/draft states
export type DraftCourseArchitectDocument = Partial<Omit<CourseArchitectDocument, 'schema_version' | 'tool'>> & {
  schema_version: '0.4'
  tool: 'Course Architect'
}

// Export all types in a namespace for convenience
export type Schema = {
  CourseLevel: CourseLevel
  DeliveryMode: DeliveryMode
  CompetencyType: CompetencyType
  BloomLevel: BloomLevel
  AIPartnershipMode: AIPartnershipMode
  NodeType: NodeType
  EdgeRelationship: EdgeRelationship
  EdgeStrength: EdgeStrength
  NodeDifficulty: NodeDifficulty
  SourceType: SourceType
  ExtractionMethod: ExtractionMethod
  AssessmentType: AssessmentType
  AIPolicyLevel: AIPolicyLevel
  RiskLevel: RiskLevel
  LearnerProfileType: LearnerProfileType
  TeachingApproach: TeachingApproach
  Formality: Formality
  EncouragementStyle: EncouragementStyle
  FeedbackApproach: FeedbackApproach
  RubricCategory: RubricCategory
  Course: Course
  CoreCompetency: CoreCompetency
  Module: Module
  KnowledgeNode: KnowledgeNode
  KnowledgeEdge: KnowledgeEdge
  KnowledgeGraph: KnowledgeGraph
  Assessment: Assessment
  Rubric: Rubric
  Prerequisites: Prerequisites
  Context: Context
  LearningPath: LearningPath
  AISystemPrompt: AISystemPrompt
  CourseArchitectDocument: CourseArchitectDocument
}

// Bloom's taxonomy helper data
export const BLOOM_LEVELS: { value: BloomLevel; label: string; verbs: string[] }[] = [
  { value: 'remember', label: 'Remember', verbs: ['define', 'list', 'recall', 'identify', 'name', 'recognize'] },
  { value: 'understand', label: 'Understand', verbs: ['explain', 'describe', 'summarize', 'interpret', 'classify', 'compare'] },
  { value: 'apply', label: 'Apply', verbs: ['use', 'demonstrate', 'implement', 'solve', 'execute', 'apply'] },
  { value: 'analyze', label: 'Analyze', verbs: ['compare', 'contrast', 'examine', 'differentiate', 'organize', 'analyze'] },
  { value: 'evaluate', label: 'Evaluate', verbs: ['judge', 'critique', 'justify', 'assess', 'evaluate', 'defend'] },
  { value: 'create', label: 'Create', verbs: ['design', 'construct', 'develop', 'formulate', 'create', 'produce'] },
]

// AI Partnership Mode helper data
export const AI_PARTNERSHIP_MODES: { value: AIPartnershipMode; label: string; description: string }[] = [
  { value: 'instruct', label: 'Instruct', description: 'AI takes lead in explanation, provides direct answers and examples' },
  { value: 'guide', label: 'Guide', description: 'AI asks questions more than answers, uses Socratic method' },
  { value: 'assist', label: 'Assist', description: 'AI available on-demand, provides help when asked' },
  { value: 'collaborate', label: 'Collaborate', description: 'AI as thought partner, co-creates with student' },
  { value: 'audit', label: 'Audit', description: 'AI as reviewer only, provides feedback without contributing to work' },
  { value: 'witness', label: 'Witness', description: 'AI observes but does not assist' },
]

// Competency types helper data
export const COMPETENCY_TYPES: { value: CompetencyType; label: string; description: string }[] = [
  { value: 'knowledge', label: 'Knowledge', description: 'Understanding concepts, theories, facts' },
  { value: 'skill', label: 'Skill', description: 'Performing procedures, techniques' },
  { value: 'integrated', label: 'Integrated', description: 'Combining knowledge + skill + judgment' },
  { value: 'disposition', label: 'Disposition', description: 'Developing habits of mind, values' },
]

// Course levels helper data
export const COURSE_LEVELS: { value: CourseLevel; label: string }[] = [
  { value: 'introductory', label: 'Introductory' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'professional', label: 'Professional' },
]

// AI Policy levels helper data
export const AI_POLICY_LEVELS: { value: AIPolicyLevel; label: string; description: string }[] = [
  { value: 'encouraged', label: 'Encouraged', description: 'AI use welcomed for learning, practice, ideation' },
  { value: 'permitted_with_attribution', label: 'Permitted with Attribution', description: 'AI use allowed if disclosed and cited' },
  { value: 'restricted', label: 'Restricted', description: 'AI prohibited on graded work; allowed for practice' },
  { value: 'prohibited', label: 'Prohibited', description: 'No AI use permitted' },
  { value: 'required', label: 'Required', description: 'AI use is required as part of the task' },
  { value: 'custom', label: 'Custom', description: 'Faculty defines specific policy' },
]

// Node types helper data
export const NODE_TYPES: { value: NodeType; label: string; description: string }[] = [
  { value: 'concept', label: 'Concept', description: 'A discrete piece of knowledge' },
  { value: 'skill', label: 'Skill', description: 'A procedural capability' },
  { value: 'competency', label: 'Competency', description: 'Integrated knowledge + skill + judgment' },
  { value: 'threshold_concept', label: 'Threshold Concept', description: 'Transformative, troublesome, integrative concept' },
  { value: 'misconception', label: 'Misconception', description: 'Common misunderstanding to address' },
]

// Edge relationship types helper data
export const EDGE_RELATIONSHIPS: { value: EdgeRelationship; label: string; description: string }[] = [
  { value: 'prerequisite_of', label: 'Prerequisite Of', description: 'Must master source before target (forms DAG)' },
  { value: 'builds_on', label: 'Builds On', description: 'Target extends/deepens source (softer than prerequisite)' },
  { value: 'part_of', label: 'Part Of', description: 'Source is component of larger target' },
  { value: 'related_to', label: 'Related To', description: 'Semantic association' },
  { value: 'contrasts_with', label: 'Contrasts With', description: 'Often confused, usefully compared' },
  { value: 'applies_to', label: 'Applies To', description: 'Source is used in context of target' },
  { value: 'example_of', label: 'Example Of', description: 'Source instantiates target' },
  { value: 'requires_skill', label: 'Requires Skill', description: 'Concept needs skill' },
  { value: 'develops_skill', label: 'Develops Skill', description: 'Concept builds skill' },
  { value: 'addresses_misconception', label: 'Addresses Misconception', description: 'Concept corrects misconception' },
]
