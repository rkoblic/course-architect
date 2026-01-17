'use client'

import { useState, useEffect } from 'react'
import { Button, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils'

interface PasteInputProps {
  onTextSubmit: (text: string) => void
  isLoading?: boolean
  className?: string
  /** External value for controlled mode */
  value?: string
  /** Called when text changes */
  onValueChange?: (text: string) => void
}

export function PasteInput({
  onTextSubmit,
  isLoading = false,
  className,
  value: externalValue,
  onValueChange,
}: PasteInputProps) {
  const [internalText, setInternalText] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Use external value if provided (controlled mode)
  const text = externalValue !== undefined ? externalValue : internalText
  const setText = (newText: string) => {
    if (onValueChange) {
      onValueChange(newText)
    }
    setInternalText(newText)
  }

  const handleSubmit = () => {
    setError(null)

    const trimmedText = text.trim()
    if (!trimmedText) {
      setError('Please enter some text')
      return
    }

    if (trimmedText.length < 100) {
      setError('Text seems too short. Please paste your full syllabus.')
      return
    }

    onTextSubmit(trimmedText)
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className={cn('w-full', className)}>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your syllabus text here..."
        disabled={isLoading}
        className="min-h-[200px] font-mono text-sm"
        error={error || undefined}
      />

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {wordCount > 0 && `${wordCount.toLocaleString()} words`}
        </span>
        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          isLoading={isLoading}
        >
          Process Text
        </Button>
      </div>
    </div>
  )
}
