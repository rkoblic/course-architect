import * as pdfjsLib from 'pdfjs-dist'

// Set up the worker - in Next.js we need to use a CDN or local worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

export interface PDFParseResult {
  text: string
  pageCount: number
  wordCount: number
}

export async function parsePDF(file: File): Promise<PDFParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const textParts: string[] = []
    const pageCount = pdf.numPages

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()

      const pageText = textContent.items
        .map((item) => {
          if ('str' in item) {
            return item.str
          }
          return ''
        })
        .join(' ')

      textParts.push(pageText)
    }

    const text = textParts.join('\n\n')
    const wordCount = text.split(/\s+/).filter(Boolean).length

    return {
      text,
      pageCount,
      wordCount,
    }
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF file. Please try pasting the text directly.')
  }
}
