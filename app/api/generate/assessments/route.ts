import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import {
  ASSESSMENT_GENERATION_SYSTEM_PROMPT,
  ASSESSMENT_GENERATION_USER_PROMPT,
} from '@/lib/prompts'

interface ModuleInput {
  id: string
  title: string
  learning_outcome: string
  bloom_level: string
}

interface ExistingAssessmentInput {
  name: string
  type: string
  weight: number
}

export async function POST(request: NextRequest) {
  try {
    const { courseTitle, coreCompetency, modules, existingAssessments } = await request.json()

    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      return NextResponse.json(
        { error: 'Modules are required for assessment generation' },
        { status: 400 }
      )
    }

    const title = courseTitle || 'Course'
    const competency = coreCompetency || ''
    const existing: ExistingAssessmentInput[] = existingAssessments || []

    const response = await callClaude(
      ASSESSMENT_GENERATION_SYSTEM_PROMPT,
      ASSESSMENT_GENERATION_USER_PROMPT(
        title,
        competency,
        modules as ModuleInput[],
        existing
      ),
      { temperature: 0.7 } // Higher temperature for more creative suggestions
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

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Assessment generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate assessments' },
      { status: 500 }
    )
  }
}
