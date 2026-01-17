import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import {
  MODULE_EXTRACTION_SYSTEM_PROMPT,
  MODULE_EXTRACTION_USER_PROMPT,
} from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    const { syllabusText, courseTitle } = await request.json()

    if (!syllabusText || typeof syllabusText !== 'string') {
      return NextResponse.json(
        { error: 'Syllabus text is required' },
        { status: 400 }
      )
    }

    // Truncate if too long
    const truncatedText = syllabusText.slice(0, 100000)
    const title = courseTitle || 'Course'

    const response = await callClaude(
      MODULE_EXTRACTION_SYSTEM_PROMPT,
      MODULE_EXTRACTION_USER_PROMPT(truncatedText, title),
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
    console.error('Module extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract modules' },
      { status: 500 }
    )
  }
}
