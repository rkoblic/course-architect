'use client'

import type { KnowledgeNode, KnowledgeEdge } from '@/types/schema'

interface NodeDetailPanelProps {
  node: KnowledgeNode | null
  edges: Map<string, KnowledgeEdge>
  nodes: Map<string, KnowledgeNode>
  onClose: () => void
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'type' | 'bloom' | 'external' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    type: 'bg-green-100 text-green-700',
    bloom: 'bg-blue-100 text-blue-700',
    external: 'bg-amber-100 text-amber-700',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${variants[variant]}`}>
      {children}
    </span>
  )
}

export function NodeDetailPanel({ node, edges, nodes, onClose }: NodeDetailPanelProps) {
  if (!node) return null

  const isExternal = node.type.startsWith('external_')

  // Get connected edges
  const incomingEdges = Array.from(edges.values()).filter(e => e.target === node.id)
  const outgoingEdges = Array.from(edges.values()).filter(e => e.source === node.id)

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-[calc(100%-2rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-gray-900 text-sm">Node Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Type and label */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={isExternal ? 'external' : 'type'}>
              {node.type.replace(/_/g, ' ')}
            </Badge>
            {node.is_entry_point && (
              <Badge>entry point</Badge>
            )}
          </div>
          <h4 className="font-medium text-gray-900">{node.label}</h4>
        </div>

        {/* Description */}
        {node.description && (
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Description</span>
            <p className="text-sm text-gray-700 mt-1">{node.description}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {node.bloom_level && (
            <div>
              <span className="text-xs text-gray-500">Bloom Level</span>
              <div><Badge variant="bloom">{node.bloom_level}</Badge></div>
            </div>
          )}
          {node.difficulty && (
            <div>
              <span className="text-xs text-gray-500">Difficulty</span>
              <div className="text-gray-700">{node.difficulty}</div>
            </div>
          )}
        </div>

        {/* External source info */}
        {isExternal && node.external_source && (
          <div className="bg-amber-50 rounded-lg p-3 space-y-1">
            <span className="text-xs text-amber-700 uppercase tracking-wide font-medium">External Source</span>
            {node.external_source.course_code && (
              <div className="text-sm">
                <span className="text-gray-500">Course:</span>{' '}
                <span className="text-gray-900">{node.external_source.course_code}</span>
                {node.external_source.course_title && (
                  <span className="text-gray-600"> - {node.external_source.course_title}</span>
                )}
              </div>
            )}
            {node.external_source.proficiency_level && (
              <div className="text-sm">
                <span className="text-gray-500">Level:</span>{' '}
                <span className="text-gray-900">{node.external_source.proficiency_level}</span>
              </div>
            )}
            <div className="text-sm">
              <Badge variant="external">
                {node.external_source.required ? 'Required' : 'Recommended'}
              </Badge>
            </div>
          </div>
        )}

        {/* Connections */}
        {(incomingEdges.length > 0 || outgoingEdges.length > 0) && (
          <div className="space-y-3">
            {incomingEdges.length > 0 && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Incoming ({incomingEdges.length})
                </span>
                <ul className="mt-1 space-y-1">
                  {incomingEdges.map(edge => {
                    const sourceNode = nodes.get(edge.source)
                    return (
                      <li key={edge.id} className="text-sm flex items-center gap-1">
                        <span className="text-gray-600">{sourceNode?.label || edge.source}</span>
                        <span className="text-gray-400">→</span>
                        <Badge>{edge.relationship.replace(/_/g, ' ')}</Badge>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {outgoingEdges.length > 0 && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Outgoing ({outgoingEdges.length})
                </span>
                <ul className="mt-1 space-y-1">
                  {outgoingEdges.map(edge => {
                    const targetNode = nodes.get(edge.target)
                    return (
                      <li key={edge.id} className="text-sm flex items-center gap-1">
                        <Badge>{edge.relationship.replace(/_/g, ' ')}</Badge>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-600">{targetNode?.label || edge.target}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Keywords */}
        {node.keywords && node.keywords.length > 0 && (
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Keywords</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {node.keywords.map((keyword, i) => (
                <Badge key={i}>{keyword}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
