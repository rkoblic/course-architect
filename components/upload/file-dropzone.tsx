'use client'

import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
  className?: string
  acceptedFormats?: string[]
}

export function FileDropzone({
  onFileSelect,
  isLoading = false,
  className,
  acceptedFormats = ['.docx', '.doc', '.txt', '.md'],
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
    setError(null)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const validateFile = useCallback(
    (file: File): boolean => {
      const fileName = file.name.toLowerCase()
      const isValidFormat = acceptedFormats.some((format) =>
        fileName.endsWith(format)
      )

      if (!isValidFormat) {
        setError(`Invalid file format. Accepted formats: ${acceptedFormats.join(', ')}`)
        return false
      }

      // Max 10MB
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit')
        return false
      }

      return true
    },
    [acceptedFormats]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)
      setError(null)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          onFileSelect(file)
        }
      }
    },
    [onFileSelect, validateFile]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          onFileSelect(file)
        }
      }
      // Reset the input
      e.target.value = ''
    },
    [onFileSelect, validateFile]
  )

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-colors',
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400',
          isLoading && 'opacity-50 pointer-events-none',
          error && 'border-red-300'
        )}
      >
        <input
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              isDragActive ? 'bg-primary-100' : 'bg-gray-100'
            )}
          >
            {isLoading ? (
              <svg
                className="animate-spin w-8 h-8 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className={cn(
                  'w-8 h-8',
                  isDragActive ? 'text-primary-600' : 'text-gray-400'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive
                ? 'Drop your syllabus here'
                : 'Drag and drop your syllabus'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or{' '}
              <span className="text-primary-600 font-medium">
                browse files
              </span>
            </p>
          </div>

          <p className="text-xs text-gray-400">
            Supports DOCX and TXT files up to 10MB
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
