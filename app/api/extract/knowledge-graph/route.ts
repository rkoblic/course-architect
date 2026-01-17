import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import {
  KNOWLEDGE_GRAPH_EXTRACTION_SYSTEM_PROMPT,
  KNOWLEDGE_GRAPH_EXTRACTION_USER_PROMPT,
} from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    const { syllabusText, modules } = await request.json()

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

    // Truncate syllabus if too long
    const truncatedText = syllabusText.slice(0, 80000)
    const modulesJson = typeof modules === 'string' ? modules : JSON.stringify(modules, null, 2)

    const response = await callClaude(
      KNOWLEDGE_GRAPH_EXTRACTION_SYSTEM_PROMPT,
      KNOWLEDGE_GRAPH_EXTRACTION_USER_PROMPT(truncatedText, modulesJson),
      {
        temperature: 0.5,
        maxTokens: 8192, // Knowledge graphs can be large
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

    // Validate DAG for prerequisite edges
    const prerequisiteEdges = (parsed.edges || []).filter(
      (e: { relationship: string }) => e.relationship === 'prerequisite_of'
    )

    const isDagValid = validateDag(
      parsed.nodes || [],
      prerequisiteEdges
    )

    return NextResponse.json({
      ...parsed,
      metadata: {
        extraction_method: 'ai_extracted',
        is_dag_valid: isDagValid,
        node_count: (parsed.nodes || []).length,
        edge_count: (parsed.edges || []).length,
      }
    })
  } catch (error) {
    console.error('Knowledge graph extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract knowledge graph' },
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
