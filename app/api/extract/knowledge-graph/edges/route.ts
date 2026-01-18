import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import {
  KNOWLEDGE_GRAPH_EDGES_SYSTEM_PROMPT,
  KNOWLEDGE_GRAPH_EDGES_USER_PROMPT,
} from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    const { syllabusText, modules, nodes } = await request.json()

    if (!syllabusText || typeof syllabusText !== 'string') {
      return NextResponse.json(
        { error: 'Syllabus text is required' },
        { status: 400 }
      )
    }

    if (!modules) {
      return NextResponse.json(
        { error: 'Modules are required' },
        { status: 400 }
      )
    }

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json(
        { error: 'Nodes array is required' },
        { status: 400 }
      )
    }

    // Truncate syllabus if too long
    const truncatedText = syllabusText.slice(0, 80000)
    const modulesJson = typeof modules === 'string' ? modules : JSON.stringify(modules, null, 2)

    // Format nodes for the prompt - include id, type, label, parent_module_id
    const nodesForPrompt = nodes.map((n: { id: string; type: string; label: string; parent_module_id?: string }) => ({
      id: n.id,
      type: n.type,
      label: n.label,
      parent_module_id: n.parent_module_id,
    }))
    const nodesJson = JSON.stringify(nodesForPrompt, null, 2)

    const response = await callClaude(
      KNOWLEDGE_GRAPH_EDGES_SYSTEM_PROMPT,
      KNOWLEDGE_GRAPH_EDGES_USER_PROMPT(truncatedText, modulesJson, nodesJson),
      {
        temperature: 0.5,
        maxTokens: 8192,
      }
    )

    // Parse the JSON response
    let parsed
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', response)
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }

    // Validate edges array exists
    if (!Array.isArray(parsed.edges)) {
      return NextResponse.json(
        { error: 'Invalid response: edges array not found' },
        { status: 500 }
      )
    }

    // Create a set of valid node IDs for validation
    const validNodeIds = new Set(nodes.map((n: { id: string }) => n.id))

    // Filter and validate edges - only keep edges with valid source and target
    const validatedEdges = parsed.edges
      .filter((edge: { source: string; target: string }) => {
        const hasValidSource = validNodeIds.has(edge.source)
        const hasValidTarget = validNodeIds.has(edge.target)
        if (!hasValidSource || !hasValidTarget) {
          console.warn(`Filtering out edge with invalid node reference: ${edge.source} -> ${edge.target}`)
        }
        return hasValidSource && hasValidTarget
      })
      .map((edge: Record<string, unknown>, index: number) => ({
        id: edge.id || `edge-${index}-${Date.now()}`,
        source: edge.source,
        target: edge.target,
        relationship: edge.relationship || 'related_to',
        strength: edge.strength || 'recommended',
        confidence: typeof edge.confidence === 'number' ? edge.confidence : 0.75,
        rationale: edge.rationale || '',
        source_type: 'ai_extracted',
        confirmed: false,
      }))

    // Validate DAG for prerequisite edges
    const prerequisiteEdges = validatedEdges.filter(
      (e: { relationship: string }) => e.relationship === 'prerequisite_of'
    )
    const isDagValid = validateDag(nodes, prerequisiteEdges)

    return NextResponse.json({
      edges: validatedEdges,
      metadata: {
        extraction_method: 'ai_extracted',
        edge_count: validatedEdges.length,
        is_dag_valid: isDagValid,
        filtered_count: parsed.edges.length - validatedEdges.length,
      }
    })
  } catch (error) {
    console.error('Knowledge graph edges extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract knowledge graph edges' },
      { status: 500 }
    )
  }
}

// DAG validation using DFS
function validateDag(
  nodes: { id: string }[],
  edges: { source: string; target: string }[]
): boolean {
  if (edges.length === 0) return true

  const adjacency = new Map<string, string[]>()
  edges.forEach((edge) => {
    const existing = adjacency.get(edge.source) || []
    adjacency.set(edge.source, [...existing, edge.target])
  })

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

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id)) return false
    }
  }

  return true
}
