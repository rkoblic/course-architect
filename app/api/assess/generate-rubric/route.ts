import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import {
  RUBRIC_GENERATION_SYSTEM_PROMPT,
  RUBRIC_GENERATION_USER_PROMPT,
} from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    const {
      assessmentName,
      assessmentType,
      assessmentDescription,
      authenticityFeatures,
      learningOutcomes,
      aiPolicy
    } = await request.json()

    if (!assessmentName || !assessmentType) {
      return NextResponse.json(
        { error: 'Assessment name and type are required' },
        { status: 400 }
      )
    }

    const featuresString = Array.isArray(authenticityFeatures)
      ? authenticityFeatures.join('\n- ')
      : authenticityFeatures || 'No specific authenticity features'

    const response = await callClaude(
      RUBRIC_GENERATION_SYSTEM_PROMPT,
      RUBRIC_GENERATION_USER_PROMPT(
        assessmentName,
        assessmentType,
        assessmentDescription || 'No description provided',
        featuresString,
        learningOutcomes || 'No specific learning outcomes provided',
        aiPolicy || 'permitted_with_attribution'
      ),
      { temperature: 0.5, maxTokens: 4096 }
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
    console.error('Rubric generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate rubric' },
      { status: 500 }
    )
  }
}
