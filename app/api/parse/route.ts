import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const text = formData.get('text') as string | null

    // Handle pasted text
    if (text) {
      const wordCount = text.split(/\s+/).filter(Boolean).length
      return NextResponse.json({
        text,
        wordCount,
        format: 'text',
      })
    }

    // Handle file upload
    if (!file) {
      return NextResponse.json(
        { error: 'No file or text provided' },
        { status: 400 }
      )
    }

    const fileName = file.name.toLowerCase()

    // For PDF files, we need to handle parsing differently on the server
    // The PDF.js library works best client-side, so we'll return a message
    // indicating the client should parse PDFs
    if (fileName.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'PDF parsing should be done client-side' },
        { status: 422 }
      )
    }

    // For DOCX files, use mammoth
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      try {
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        // mammoth in Node.js needs a Buffer, not ArrayBuffer
        const buffer = Buffer.from(arrayBuffer)
        const result = await mammoth.extractRawText({ buffer })

        const extractedText = result.value
        const wordCount = extractedText.split(/\s+/).filter(Boolean).length

        return NextResponse.json({
          text: extractedText,
          wordCount,
          format: 'docx',
        })
      } catch (docxError) {
        console.error('DOCX parse error:', docxError)
        const errorMessage = docxError instanceof Error ? docxError.message : 'Unknown error'
        if (errorMessage.includes('body element') || errorMessage.includes('Could not find')) {
          return NextResponse.json(
            { error: 'Could not parse this file. If it\'s a .doc file (old Word format), please save it as .docx or paste the text directly.' },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { error: `Failed to parse DOCX: ${errorMessage}` },
          { status: 500 }
        )
      }
    }

    // For text files
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      const extractedText = await file.text()
      const wordCount = extractedText.split(/\s+/).filter(Boolean).length

      return NextResponse.json({
        text: extractedText,
        wordCount,
        format: 'text',
      })
    }

    return NextResponse.json(
      { error: 'Unsupported file format. Please upload a PDF, DOCX, or TXT file.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json(
      { error: 'Failed to parse file' },
      { status: 500 }
    )
  }
}
