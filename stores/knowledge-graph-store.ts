import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { KnowledgeNode, KnowledgeEdge, KnowledgeGraphMetadata, ExtractionMethod } from '@/types/schema'

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
}

// Helper to rebuild indexes
function rebuildIndexes(
  nodes: Map<string, KnowledgeNode>,
  edges: Map<string, KnowledgeEdge>
): {
  nodesByModule: Map<string, string[]>
  incomingEdges: Map<string, string[]>
  outgoingEdges: Map<string, string[]>
} {
  const nodesByModule = new Map<string, string[]>()
  const incomingEdges = new Map<string, string[]>()
  const outgoingEdges = new Map<string, string[]>()

  // Build nodesByModule
  nodes.forEach((node) => {
    if (node.parent_module_id) {
      const existing = nodesByModule.get(node.parent_module_id) || []
      nodesByModule.set(node.parent_module_id, [...existing, node.id])
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

  return { nodesByModule, incomingEdges, outgoingEdges }
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

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'course-architect-knowledge-graph',
      // Custom serialization for Maps
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
            },
          }
          localStorage.setItem(name, JSON.stringify(data))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
