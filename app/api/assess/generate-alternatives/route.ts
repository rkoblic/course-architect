import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import {
  ALTERNATIVE_GENERATION_SYSTEM_PROMPT,
  ALTERNATIVE_GENERATION_USER_PROMPT,
} from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    const {
      assessmentName,
      assessmentType,
      assessmentDescription,
      vulnerabilityRationale,
      learningOutcomes,
      courseContext
    } = await request.json()

    if (!assessmentName || !assessmentType) {
      return NextResponse.json(
        { error: 'Assessment name and type are required' },
        { status: 400 }
      )
    }

    const response = await callClaude(
      ALTERNATIVE_GENERATION_SYSTEM_PROMPT,
      ALTERNATIVE_GENERATION_USER_PROMPT(
        assessmentName,
        assessmentType,
        assessmentDescription || 'No description provided',
        vulnerabilityRationale || 'No vulnerability analysis provided',
        learningOutcomes || 'No specific learning outcomes provided',
        courseContext || 'No additional course context provided'
      ),
      { temperature: 0.7, maxTokens: 4096 }
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
    console.error('Alternative generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate alternatives' },
      { status: 500 }
    )
  }
}
