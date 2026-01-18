'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { KnowledgeNode, NodeType } from '@/types/schema'

export interface GraphNodeData {
  knowledgeNode: KnowledgeNode
  isSelected?: boolean
}

const nodeColors: Record<NodeType, { bg: string; border: string; text: string }> = {
  concept: { bg: 'bg-sky-100', border: 'border-sky-400', text: 'text-sky-800' },
  skill: { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-800' },
  competency: { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-800' },
  threshold_concept: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-800' },
  misconception: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800' },
  external_concept: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800' },
  external_skill: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800' },
  external_knowledge: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800' },
}

function GraphNodeComponent({ data, selected }: NodeProps<GraphNodeData>) {
  const { knowledgeNode } = data
  const colors = nodeColors[knowledgeNode.type] || nodeColors.concept
  const isExternal = knowledgeNode.type.startsWith('external_')

  return (
    <div
      className={`
        px-3 py-2 rounded-lg border-2 shadow-sm min-w-[160px] max-w-[200px]
        ${colors.bg} ${colors.border}
        ${selected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
        ${knowledgeNode.is_entry_point ? 'ring-2 ring-indigo-400' : ''}
        transition-shadow cursor-pointer
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-400 !w-2 !h-2"
      />

      <div className="space-y-1">
        {/* Type badge */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className={`text-[10px] font-medium uppercase tracking-wide ${colors.text}`}>
            {knowledgeNode.type.replace(/_/g, ' ')}
          </span>
          {knowledgeNode.is_entry_point && (
            <span className="text-[10px] bg-indigo-200 text-indigo-700 px-1 rounded">
              entry
            </span>
          )}
          {isExternal && knowledgeNode.external_source?.required && (
            <span className="text-[10px] bg-amber-200 text-amber-700 px-1 rounded">
              required
            </span>
          )}
        </div>

        {/* Label */}
        <div className="font-medium text-sm text-gray-900 leading-tight line-clamp-2">
          {knowledgeNode.label}
        </div>

        {/* Bloom level if present */}
        {knowledgeNode.bloom_level && (
          <div className="text-[10px] text-gray-500">
            {knowledgeNode.bloom_level}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400 !w-2 !h-2"
      />
    </div>
  )
}

export const GraphNode = memo(GraphNodeComponent)
