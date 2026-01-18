import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import {
  KNOWLEDGE_GRAPH_NODES_SYSTEM_PROMPT,
  KNOWLEDGE_GRAPH_NODES_USER_PROMPT,
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
      KNOWLEDGE_GRAPH_NODES_SYSTEM_PROMPT,
      KNOWLEDGE_GRAPH_NODES_USER_PROMPT(truncatedText, modulesJson),
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

    // Validate nodes array exists
    if (!Array.isArray(parsed.nodes)) {
      return NextResponse.json(
        { error: 'Invalid response: nodes array not found' },
        { status: 500 }
      )
    }

    // Ensure all nodes have required fields with defaults
    const validatedNodes = parsed.nodes.map((node: Record<string, unknown>, index: number) => ({
      id: node.id || `concept-${index}-${Date.now()}`,
      type: node.type || 'concept',
      label: node.label || 'Unnamed Concept',
      description: node.description || '',
      bloom_level: node.bloom_level || 'understand',
      difficulty: node.difficulty || 'intermediate',
      parent_module_id: node.parent_module_id || null,
      keywords: Array.isArray(node.keywords) ? node.keywords : [],
      ai_notes: node.ai_notes || null,
      common_misconceptions: Array.isArray(node.common_misconceptions) ? node.common_misconceptions : null,
      is_entry_point: Boolean(node.is_entry_point),
      source: 'ai_extracted',
      confirmed: false,
    }))

    return NextResponse.json({
      nodes: validatedNodes,
      metadata: {
        extraction_method: 'ai_extracted',
        node_count: validatedNodes.length,
      }
    })
  } catch (error) {
    console.error('Knowledge graph nodes extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract knowledge graph nodes' },
      { status: 500 }
    )
  }
}
