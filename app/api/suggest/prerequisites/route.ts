import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import {
  PREREQUISITES_SUGGESTION_SYSTEM_PROMPT,
  PREREQUISITES_SUGGESTION_USER_PROMPT,
} from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    const { syllabusText, courseTitle, discipline } = await request.json()

    if (!syllabusText || typeof syllabusText !== 'string') {
      return NextResponse.json(
        { error: 'Syllabus text is required' },
        { status: 400 }
      )
    }

    // Truncate if too long
    const truncatedText = syllabusText.slice(0, 50000)

    const response = await callClaude(
      PREREQUISITES_SUGGESTION_SYSTEM_PROMPT,
      PREREQUISITES_SUGGESTION_USER_PROMPT(truncatedText, courseTitle, discipline),
      { temperature: 0.5 }
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
    console.error('Prerequisites suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}
