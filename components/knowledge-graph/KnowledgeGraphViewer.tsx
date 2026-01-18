'use client'

import { useMemo, useState, useCallback } from 'react'
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'

import type { KnowledgeNode, KnowledgeEdge, NodeType } from '@/types/schema'
import { GraphNode, type GraphNodeData } from './GraphNode'
import { NodeDetailPanel } from './NodeDetailPanel'
import { getLayoutedElements } from './layout'

interface KnowledgeGraphViewerProps {
  nodes: Map<string, KnowledgeNode>
  edges: Map<string, KnowledgeEdge>
}

// Custom node types
const nodeTypes = {
  graphNode: GraphNode,
}

// Edge colors by relationship type
const edgeColors: Record<string, string> = {
  prerequisite_of: '#6366f1', // indigo
  builds_on: '#0ea5e9', // sky
  part_of: '#8b5cf6', // violet
  related_to: '#94a3b8', // gray
  contrasts_with: '#f59e0b', // amber
  applies_to: '#10b981', // emerald
  example_of: '#06b6d4', // cyan
  requires_skill: '#ec4899', // pink
  develops_skill: '#22c55e', // green
  addresses_misconception: '#ef4444', // red
  assumed_by: '#f59e0b', // amber
  entry_point_for: '#6366f1', // indigo
}

// MiniMap node colors
const miniMapNodeColor = (node: Node<GraphNodeData>): string => {
  const type = node.data?.knowledgeNode?.type
  const colors: Record<NodeType, string> = {
    concept: '#0ea5e9',
    skill: '#10b981',
    competency: '#6366f1',
    threshold_concept: '#a855f7',
    misconception: '#ef4444',
    external_concept: '#f59e0b',
    external_skill: '#f59e0b',
    external_knowledge: '#f59e0b',
  }
  return colors[type as NodeType] || '#94a3b8'
}

export function KnowledgeGraphViewer({ nodes, edges }: KnowledgeGraphViewerProps) {
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)

  // Transform knowledge graph data to React Flow format
  const { initialNodes, initialEdges } = useMemo(() => {
    const flowNodes: Node<GraphNodeData>[] = Array.from(nodes.values()).map((node) => ({
      id: node.id,
      type: 'graphNode',
      position: { x: 0, y: 0 }, // Will be set by layout
      data: {
        knowledgeNode: node,
        isSelected: selectedNode?.id === node.id,
      },
    }))

    const flowEdges: Edge[] = Array.from(edges.values()).map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.relationship.replace(/_/g, ' '),
      labelStyle: { fontSize: 10, fill: '#64748b' },
      labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
      labelBgPadding: [4, 2] as [number, number],
      style: {
        stroke: edgeColors[edge.relationship] || '#94a3b8',
        strokeWidth: edge.strength === 'required' ? 2 : 1,
      },
      animated: edge.relationship === 'prerequisite_of',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edgeColors[edge.relationship] || '#94a3b8',
      },
    }))

    // Apply dagre layout
    const layouted = getLayoutedElements(flowNodes, flowEdges, {
      direction: 'TB',
      nodeWidth: 200,
      nodeHeight: 80,
      rankSep: 100,
      nodeSep: 50,
    })

    return { initialNodes: layouted.nodes, initialEdges: layouted.edges }
  }, [nodes, edges, selectedNode?.id])

  const [flowNodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Handle node click
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    const knowledgeNode = nodes.get(node.id)
    setSelectedNode(knowledgeNode || null)
  }, [nodes])

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // Empty state
  if (nodes.size === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <p className="font-medium">No knowledge graph data</p>
          <p className="text-sm mt-1">Complete the modules step to generate concepts and relationships.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px] relative rounded-lg border border-gray-200 overflow-hidden">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        <Controls
          className="!bg-white !border-gray-200 !shadow-sm"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={miniMapNodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bg-gray-100 !border-gray-200"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#e2e8f0"
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-3 text-xs">
        <div className="font-medium text-gray-700 mb-2">Node Types</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-sky-400" />
            <span className="text-gray-600">Concept</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-400" />
            <span className="text-gray-600">Skill</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-400" />
            <span className="text-gray-600">Threshold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-gray-600">External</span>
          </div>
        </div>
      </div>

      {/* Node detail panel */}
      <NodeDetailPanel
        node={selectedNode}
        edges={edges}
        nodes={nodes}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  )
}
