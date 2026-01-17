import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import {
  METADATA_EXTRACTION_SYSTEM_PROMPT,
  METADATA_EXTRACTION_USER_PROMPT,
} from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    const { syllabusText } = await request.json()

    if (!syllabusText || typeof syllabusText !== 'string') {
      return NextResponse.json(
        { error: 'Syllabus text is required' },
        { status: 400 }
      )
    }

    // Truncate if too long (keeping ~100k chars for context)
    const truncatedText = syllabusText.slice(0, 100000)

    const response = await callClaude(
      METADATA_EXTRACTION_SYSTEM_PROMPT,
      METADATA_EXTRACTION_USER_PROMPT(truncatedText),
      { temperature: 0.3 } // Lower temperature for more consistent extraction
    )

    // Parse the JSON response
    let parsed
    try {
      // Try to extract JSON from the response (in case there's extra text)
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
    console.error('Metadata extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract metadata' },
      { status: 500 }
    )
  }
}
