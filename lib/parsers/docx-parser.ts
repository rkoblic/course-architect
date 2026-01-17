import mammoth from 'mammoth'

export interface DOCXParseResult {
  text: string
  wordCount: number
}

export async function parseDOCX(file: File): Promise<DOCXParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })

    const text = result.value
    const wordCount = text.split(/\s+/).filter(Boolean).length

    if (result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages)
    }

    return {
      text,
      wordCount,
    }
  } catch (error) {
    console.error('DOCX parsing error:', error)
    throw new Error('Failed to parse DOCX file. Please try pasting the text directly.')
  }
}
