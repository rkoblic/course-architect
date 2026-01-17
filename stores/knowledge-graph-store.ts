import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  KnowledgeNode,
  KnowledgeEdge,
  KnowledgeGraphMetadata,
  ExtractionMethod,
  Prerequisites,
  PrerequisiteCourse,
  PrerequisiteSkill,
  PrerequisiteKnowledge,
} from '@/types/schema'

interface KnowledgeGraphState {
  // Metadata
  metadata: KnowledgeGraphMetadata

  // Nodes and edges stored as Maps for O(1) lookup (serialized as arrays)
  nodes: Map<string, KnowledgeNode>
  edges: Map<string, KnowledgeEdge>

  // Derived indexes
  nodesByModule: Map<string, string[]>
  incomingEdges: Map<string, string[]>
  outgoingEdges: Map<string, string[]>
  // External node indexes
  externalNodes: Map<string, KnowledgeNode>
  entryPointNodes: Set<string>

  // Actions
  setMetadata: (metadata: Partial<KnowledgeGraphMetadata>) => void

  // Node actions
  addNode: (node: KnowledgeNode) => void
  updateNode: (id: string, updates: Partial<KnowledgeNode>) => void
  removeNode: (id: string) => void
  confirmNode: (id: string) => void
  setNodes: (nodes: KnowledgeNode[]) => void

  // Edge actions
  addEdge: (edge: KnowledgeEdge) => void
  updateEdge: (id: string, updates: Partial<KnowledgeEdge>) => void
  removeEdge: (id: string) => void
  confirmEdge: (id: string) => void
  setEdges: (edges: KnowledgeEdge[]) => void

  // Validation
  validateDag: () => boolean

  // Getters
  getNode: (id: string) => KnowledgeNode | undefined
  getEdge: (id: string) => KnowledgeEdge | undefined
  getNodesByModule: (moduleId: string) => KnowledgeNode[]
  getIncomingEdges: (nodeId: string) => KnowledgeEdge[]
  getOutgoingEdges: (nodeId: string) => KnowledgeEdge[]

  // External node helpers
  getExternalNodes: () => KnowledgeNode[]
  getEntryPoints: () => KnowledgeNode[]
  addExternalNode: (node: KnowledgeNode) => void

  // Migration utilities
  migratePrerequisites: (prereqs: Prerequisites) => void
  exportAsPrerequisites: () => Prerequisites

  // Bulk operations
  reset: () => void
}

const initialMetadata: KnowledgeGraphMetadata = {
  extraction_method: 'ai_extracted',
  is_dag_valid: true,
}

const initialState = {
  metadata: initialMetadata,
  nodes: new Map<string, KnowledgeNode>(),
  edges: new Map<string, KnowledgeEdge>(),
  nodesByModule: new Map<string, string[]>(),
  incomingEdges: new Map<string, string[]>(),
  outgoingEdges: new Map<string, string[]>(),
  externalNodes: new Map<string, KnowledgeNode>(),
  entryPointNodes: new Set<string>(),
}

// Helper to check if a node type is external
function isExternalNodeType(type: string): boolean {
  return type === 'external_concept' || type === 'external_skill' || type === 'external_knowledge'
}

// Helper to rebuild indexes
function rebuildIndexes(
  nodes: Map<string, KnowledgeNode>,
  edges: Map<string, KnowledgeEdge>
): {
  nodesByModule: Map<string, string[]>
  incomingEdges: Map<string, string[]>
  outgoingEdges: Map<string, string[]>
  externalNodes: Map<string, KnowledgeNode>
  entryPointNodes: Set<string>
} {
  const nodesByModule = new Map<string, string[]>()
  const incomingEdges = new Map<string, string[]>()
  const outgoingEdges = new Map<string, string[]>()
  const externalNodes = new Map<string, KnowledgeNode>()
  const entryPointNodes = new Set<string>()

  // Build nodesByModule and external nodes index
  nodes.forEach((node) => {
    if (node.parent_module_id) {
      const existing = nodesByModule.get(node.parent_module_id) || []
      nodesByModule.set(node.parent_module_id, [...existing, node.id])
    }
    // Track external nodes
    if (isExternalNodeType(node.type)) {
      externalNodes.set(node.id, node)
    }
    // Track entry points
    if (node.is_entry_point) {
      entryPointNodes.add(node.id)
    }
  })

  // Build edge indexes
  edges.forEach((edge) => {
    // Incoming edges
    const incoming = incomingEdges.get(edge.target) || []
    incomingEdges.set(edge.target, [...incoming, edge.id])

    // Outgoing edges
    const outgoing = outgoingEdges.get(edge.source) || []
    outgoingEdges.set(edge.source, [...outgoing, edge.id])
  })

  return { nodesByModule, incomingEdges, outgoingEdges, externalNodes, entryPointNodes }
}

// DAG validation using DFS
function checkDagValidity(
  nodes: Map<string, KnowledgeNode>,
  edges: Map<string, KnowledgeEdge>
): boolean {
  // Only check prerequisite_of edges for DAG validity
  const prerequisiteEdges = Array.from(edges.values()).filter(
    (e) => e.relationship === 'prerequisite_of'
  )

  if (prerequisiteEdges.length === 0) return true

  // Build adjacency list
  const adjacency = new Map<string, string[]>()
  prerequisiteEdges.forEach((edge) => {
    const existing = adjacency.get(edge.source) || []
    adjacency.set(edge.source, [...existing, edge.target])
  })

  // DFS cycle detection
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function hasCycle(nodeId: string): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const neighbors = adjacency.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true
      } else if (recursionStack.has(neighbor)) {
        return true
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  // Check all nodes
  for (const nodeId of nodes.keys()) {
    if (!visited.has(nodeId)) {
      if (hasCycle(nodeId)) return false
    }
  }

  return true
}

// Generate node ID
export function generateNodeId(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
}

// Generate edge ID
export function generateEdgeId(): string {
  return `edge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
}

export const useKnowledgeGraphStore = create<KnowledgeGraphState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setMetadata: (updates) =>
        set((state) => ({
          metadata: { ...state.metadata, ...updates },
        })),

      // Node actions
      addNode: (node) =>
        set((state) => {
          const newNodes = new Map(state.nodes)
          newNodes.set(node.id, node)
          const indexes = rebuildIndexes(newNodes, state.edges)
          return {
            nodes: newNodes,
            ...indexes,
            metadata: {
              ...state.metadata,
              node_count: newNodes.size,
            },
          }
        }),

      updateNode: (id, updates) =>
        set((state) => {
          const newNodes = new Map(state.nodes)
          const existing = newNodes.get(id)
          if (existing) {
            newNodes.set(id, { ...existing, ...updates })
          }
          const indexes = rebuildIndexes(newNodes, state.edges)
          return { nodes: newNodes, ...indexes }
        }),

      removeNode: (id) =>
        set((state) => {
          const newNodes = new Map(state.nodes)
          newNodes.delete(id)

          // Also remove edges connected to this node
          const newEdges = new Map(state.edges)
          state.edges.forEach((edge, edgeId) => {
            if (edge.source === id || edge.target === id) {
              newEdges.delete(edgeId)
            }
          })

          const indexes = rebuildIndexes(newNodes, newEdges)
          const isDagValid = checkDagValidity(newNodes, newEdges)

          return {
            nodes: newNodes,
            edges: newEdges,
            ...indexes,
            metadata: {
              ...state.metadata,
              node_count: newNodes.size,
              edge_count: newEdges.size,
              is_dag_valid: isDagValid,
            },
          }
        }),

      confirmNode: (id) =>
        set((state) => {
          const newNodes = new Map(state.nodes)
          const existing = newNodes.get(id)
          if (existing) {
            newNodes.set(id, { ...existing, confirmed: true, source: 'faculty_defined' })
          }
          return { nodes: newNodes }
        }),

      setNodes: (nodesArray) =>
        set((state) => {
          const newNodes = new Map<string, KnowledgeNode>()
          nodesArray.forEach((node) => newNodes.set(node.id, node))
          const indexes = rebuildIndexes(newNodes, state.edges)
          const isDagValid = checkDagValidity(newNodes, state.edges)
          return {
            nodes: newNodes,
            ...indexes,
            metadata: {
              ...state.metadata,
              node_count: newNodes.size,
              is_dag_valid: isDagValid,
            },
          }
        }),

      // Edge actions
      addEdge: (edge) =>
        set((state) => {
          const newEdges = new Map(state.edges)
          newEdges.set(edge.id, edge)
          const indexes = rebuildIndexes(state.nodes, newEdges)
          const isDagValid = checkDagValidity(state.nodes, newEdges)
          return {
            edges: newEdges,
            ...indexes,
            metadata: {
              ...state.metadata,
              edge_count: newEdges.size,
              is_dag_valid: isDagValid,
            },
          }
        }),

      updateEdge: (id, updates) =>
        set((state) => {
          const newEdges = new Map(state.edges)
          const existing = newEdges.get(id)
          if (existing) {
            newEdges.set(id, { ...existing, ...updates })
          }
          const indexes = rebuildIndexes(state.nodes, newEdges)
          const isDagValid = checkDagValidity(state.nodes, newEdges)
          return {
            edges: newEdges,
            ...indexes,
            metadata: {
              ...state.metadata,
              is_dag_valid: isDagValid,
            },
          }
        }),

      removeEdge: (id) =>
        set((state) => {
          const newEdges = new Map(state.edges)
          newEdges.delete(id)
          const indexes = rebuildIndexes(state.nodes, newEdges)
          const isDagValid = checkDagValidity(state.nodes, newEdges)
          return {
            edges: newEdges,
            ...indexes,
            metadata: {
              ...state.metadata,
              edge_count: newEdges.size,
              is_dag_valid: isDagValid,
            },
          }
        }),

      confirmEdge: (id) =>
        set((state) => {
          const newEdges = new Map(state.edges)
          const existing = newEdges.get(id)
          if (existing) {
            newEdges.set(id, { ...existing, confirmed: true, confidence: 1.0, source_type: 'faculty_defined' })
          }
          return { edges: newEdges }
        }),

      setEdges: (edgesArray) =>
        set((state) => {
          const newEdges = new Map<string, KnowledgeEdge>()
          edgesArray.forEach((edge) => newEdges.set(edge.id, edge))
          const indexes = rebuildIndexes(state.nodes, newEdges)
          const isDagValid = checkDagValidity(state.nodes, newEdges)
          return {
            edges: newEdges,
            ...indexes,
            metadata: {
              ...state.metadata,
              edge_count: newEdges.size,
              is_dag_valid: isDagValid,
            },
          }
        }),

      // Validation
      validateDag: () => {
        const state = get()
        const isValid = checkDagValidity(state.nodes, state.edges)
        set((s) => ({
          metadata: { ...s.metadata, is_dag_valid: isValid, last_validated: new Date().toISOString() },
        }))
        return isValid
      },

      // Getters
      getNode: (id) => get().nodes.get(id),
      getEdge: (id) => get().edges.get(id),

      getNodesByModule: (moduleId) => {
        const state = get()
        const nodeIds = state.nodesByModule.get(moduleId) || []
        return nodeIds.map((id) => state.nodes.get(id)).filter(Boolean) as KnowledgeNode[]
      },

      getIncomingEdges: (nodeId) => {
        const state = get()
        const edgeIds = state.incomingEdges.get(nodeId) || []
        return edgeIds.map((id) => state.edges.get(id)).filter(Boolean) as KnowledgeEdge[]
      },

      getOutgoingEdges: (nodeId) => {
        const state = get()
        const edgeIds = state.outgoingEdges.get(nodeId) || []
        return edgeIds.map((id) => state.edges.get(id)).filter(Boolean) as KnowledgeEdge[]
      },

      // External node helpers
      getExternalNodes: () => {
        const state = get()
        return Array.from(state.externalNodes.values())
      },

      getEntryPoints: () => {
        const state = get()
        return Array.from(state.entryPointNodes)
          .map((id) => state.nodes.get(id))
          .filter(Boolean) as KnowledgeNode[]
      },

      addExternalNode: (node) =>
        set((state) => {
          // Ensure node has an external type
          if (!isExternalNodeType(node.type)) {
            console.warn('addExternalNode called with non-external node type:', node.type)
          }
          const newNodes = new Map(state.nodes)
          newNodes.set(node.id, node)
          const indexes = rebuildIndexes(newNodes, state.edges)
          return {
            nodes: newNodes,
            ...indexes,
            metadata: {
              ...state.metadata,
              node_count: newNodes.size,
            },
          }
        }),

      // Migration utilities
      migratePrerequisites: (prereqs) =>
        set((state) => {
          const newNodes = new Map(state.nodes)
          const newEdges = new Map(state.edges)

          // Find Module 1 entry point nodes (nodes from first module)
          const module1Nodes = Array.from(state.nodes.values()).filter(
            (n) => n.parent_module_id && n.parent_module_id.includes('1')
          )
          const firstEntryNodeId = module1Nodes.length > 0 ? module1Nodes[0].id : null

          // Migrate courses to external_concept nodes
          if (prereqs.courses) {
            prereqs.courses.forEach((course, index) => {
              // Create external nodes for each concept assumed from the course
              if (course.concepts_assumed && course.concepts_assumed.length > 0) {
                course.concepts_assumed.forEach((concept, conceptIndex) => {
                  const nodeId = `ext-concept-${course.code.replace(/\s+/g, '-')}-${conceptIndex}-${Date.now()}`
                  const node: KnowledgeNode = {
                    id: nodeId,
                    type: 'external_concept',
                    label: concept,
                    description: `Concept from ${course.code}${course.title ? ` - ${course.title}` : ''}`,
                    source: 'faculty_defined',
                    confirmed: true,
                    external_source: {
                      type: 'course',
                      course_code: course.code,
                      course_title: course.title,
                      required: course.required,
                    },
                  }
                  newNodes.set(nodeId, node)

                  // Create edge to first entry node if available
                  if (firstEntryNodeId) {
                    const edgeId = `edge-ext-${nodeId}-${Date.now()}`
                    newEdges.set(edgeId, {
                      id: edgeId,
                      source: nodeId,
                      target: firstEntryNodeId,
                      relationship: 'assumed_by',
                      strength: course.required ? 'required' : 'recommended',
                      source_type: 'faculty_defined',
                      confirmed: true,
                    })
                  }
                })
              } else {
                // Create a single external concept node for the course
                const nodeId = `ext-course-${course.code.replace(/\s+/g, '-')}-${Date.now()}`
                const node: KnowledgeNode = {
                  id: nodeId,
                  type: 'external_concept',
                  label: `${course.code}${course.title ? `: ${course.title}` : ''}`,
                  description: course.title || `Prerequisite course ${course.code}`,
                  source: 'faculty_defined',
                  confirmed: true,
                  external_source: {
                    type: 'course',
                    course_code: course.code,
                    course_title: course.title,
                    required: course.required,
                  },
                }
                newNodes.set(nodeId, node)

                if (firstEntryNodeId) {
                  const edgeId = `edge-ext-${nodeId}-${Date.now()}`
                  newEdges.set(edgeId, {
                    id: edgeId,
                    source: nodeId,
                    target: firstEntryNodeId,
                    relationship: 'assumed_by',
                    strength: course.required ? 'required' : 'recommended',
                    source_type: 'faculty_defined',
                    confirmed: true,
                  })
                }
              }
            })
          }

          // Migrate skills to external_skill nodes
          if (prereqs.skills) {
            prereqs.skills.forEach((skill, index) => {
              const nodeId = `ext-skill-${index}-${Date.now()}`
              const node: KnowledgeNode = {
                id: nodeId,
                type: 'external_skill',
                label: skill.skill,
                description: skill.proficiency_level
                  ? `Required proficiency: ${skill.proficiency_level}`
                  : undefined,
                source: 'faculty_defined',
                confirmed: true,
                external_source: {
                  type: 'skill',
                  proficiency_level: skill.proficiency_level,
                  required: skill.required,
                },
              }
              newNodes.set(nodeId, node)

              if (firstEntryNodeId) {
                const edgeId = `edge-ext-${nodeId}-${Date.now()}`
                newEdges.set(edgeId, {
                  id: edgeId,
                  source: nodeId,
                  target: firstEntryNodeId,
                  relationship: 'assumed_by',
                  strength: skill.required ? 'required' : 'recommended',
                  source_type: 'faculty_defined',
                  confirmed: true,
                })
              }
            })
          }

          // Migrate knowledge areas to external_knowledge nodes
          if (prereqs.knowledge) {
            prereqs.knowledge.forEach((knowledge, index) => {
              const nodeId = `ext-knowledge-${index}-${Date.now()}`
              const node: KnowledgeNode = {
                id: nodeId,
                type: 'external_knowledge',
                label: knowledge.area,
                description: knowledge.description,
                source: 'faculty_defined',
                confirmed: true,
                external_source: {
                  type: 'knowledge_area',
                  required: knowledge.required,
                },
              }
              newNodes.set(nodeId, node)

              if (firstEntryNodeId) {
                const edgeId = `edge-ext-${nodeId}-${Date.now()}`
                newEdges.set(edgeId, {
                  id: edgeId,
                  source: nodeId,
                  target: firstEntryNodeId,
                  relationship: 'assumed_by',
                  strength: knowledge.required ? 'required' : 'recommended',
                  source_type: 'faculty_defined',
                  confirmed: true,
                })
              }
            })
          }

          // Mark first module nodes as entry points
          if (module1Nodes.length > 0) {
            module1Nodes.forEach((node) => {
              newNodes.set(node.id, { ...node, is_entry_point: true })
            })
          }

          const indexes = rebuildIndexes(newNodes, newEdges)
          const isDagValid = checkDagValidity(newNodes, newEdges)

          return {
            nodes: newNodes,
            edges: newEdges,
            ...indexes,
            metadata: {
              ...state.metadata,
              node_count: newNodes.size,
              edge_count: newEdges.size,
              is_dag_valid: isDagValid,
            },
          }
        }),

      exportAsPrerequisites: () => {
        const state = get()
        const prerequisites: Prerequisites = {
          courses: [],
          skills: [],
          knowledge: [],
        }

        // Group external concept nodes by course
        const courseMap = new Map<string, PrerequisiteCourse>()

        state.externalNodes.forEach((node) => {
          if (node.type === 'external_concept' && node.external_source?.type === 'course') {
            const courseCode = node.external_source.course_code || 'UNKNOWN'
            const existing = courseMap.get(courseCode)
            if (existing) {
              // Add concept to existing course
              if (!existing.concepts_assumed) {
                existing.concepts_assumed = []
              }
              existing.concepts_assumed.push(node.label)
            } else {
              // Create new course entry
              courseMap.set(courseCode, {
                code: courseCode,
                title: node.external_source.course_title,
                required: node.external_source.required,
                concepts_assumed: [node.label],
              })
            }
          } else if (node.type === 'external_skill' && node.external_source?.type === 'skill') {
            prerequisites.skills!.push({
              skill: node.label,
              proficiency_level: node.external_source.proficiency_level,
              required: node.external_source.required,
            })
          } else if (node.type === 'external_knowledge' && node.external_source?.type === 'knowledge_area') {
            prerequisites.knowledge!.push({
              area: node.label,
              description: node.description,
              required: node.external_source.required,
            })
          }
        })

        // Convert course map to array
        prerequisites.courses = Array.from(courseMap.values())

        // Clean up empty arrays
        if (prerequisites.courses!.length === 0) delete prerequisites.courses
        if (prerequisites.skills!.length === 0) delete prerequisites.skills
        if (prerequisites.knowledge!.length === 0) delete prerequisites.knowledge

        return prerequisites
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'course-architect-knowledge-graph',
      // Custom serialization for Maps and Sets
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const data = JSON.parse(str)
          return {
            state: {
              ...data.state,
              nodes: new Map(data.state.nodes || []),
              edges: new Map(data.state.edges || []),
              nodesByModule: new Map(data.state.nodesByModule || []),
              incomingEdges: new Map(data.state.incomingEdges || []),
              outgoingEdges: new Map(data.state.outgoingEdges || []),
              externalNodes: new Map(data.state.externalNodes || []),
              entryPointNodes: new Set(data.state.entryPointNodes || []),
            },
          }
        },
        setItem: (name, value) => {
          const data = {
            state: {
              ...value.state,
              nodes: Array.from(value.state.nodes.entries()),
              edges: Array.from(value.state.edges.entries()),
              nodesByModule: Array.from(value.state.nodesByModule.entries()),
              incomingEdges: Array.from(value.state.incomingEdges.entries()),
              outgoingEdges: Array.from(value.state.outgoingEdges.entries()),
              externalNodes: Array.from(value.state.externalNodes.entries()),
              entryPointNodes: Array.from(value.state.entryPointNodes),
            },
          }
          localStorage.setItem(name, JSON.stringify(data))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
