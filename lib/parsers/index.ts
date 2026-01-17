import { parsePDF, type PDFParseResult } from './pdf-parser'
import { parseDOCX, type DOCXParseResult } from './docx-parser'

export type ParseResult = {
  text: string
  wordCount: number
  pageCount?: number
  format: 'pdf' | 'docx' | 'text'
}

export async function parseFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.pdf')) {
    const result = await parsePDF(file)
    return {
      text: result.text,
      wordCount: result.wordCount,
      pageCount: result.pageCount,
      format: 'pdf',
    }
  }

  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    const result = await parseDOCX(file)
    return {
      text: result.text,
      wordCount: result.wordCount,
      format: 'docx',
    }
  }

  // For text files, read as text
  if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    const text = await file.text()
    return {
      text,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      format: 'text',
    }
  }

  throw new Error(
    'Unsupported file format. Please upload a PDF, DOCX, or TXT file.'
  )
}

export function parseText(text: string): ParseResult {
  return {
    text,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    format: 'text',
  }
}

export { parsePDF, parseDOCX }
export type { PDFParseResult, DOCXParseResult }
