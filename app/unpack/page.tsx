'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { StepNavigation } from '@/components/layout'
import { FileDropzone, PasteInput, ExtractionProgressDisplay } from '@/components/upload'
import { useCourseStore, useModuleStore, useKnowledgeGraphStore, useContextStore, useUIStore } from '@/stores'
import { parseFile, parseText } from '@/lib/parsers'
import {
  demoCourse,
  demoCoreCompetency,
  demoModules,
  demoNodes,
  demoEdges,
  demoAIPolicy,
  demoLearnerProfile,
  demoTeachingApproach,
  demoInstructorPersona,
  demoDisciplineConventions,
  demoPrerequisites,
  demoSyllabusText,
} from '@/lib/demo-data'

export default function UnpackStep1() {
  const router = useRouter()
  const [inputMethod, setInputMethod] = useState<'file' | 'paste'>('file')
  const [pasteText, setPasteText] = useState('')
  const [isDemoMode, setIsDemoMode] = useState(false)

  const { setSyllabusText, setCourse, setCoreCompetency, syllabusText } = useCourseStore()
  const { setModules } = useModuleStore()
  const { setNodes, setEdges, setMetadata } = useKnowledgeGraphStore()
  const { setAIPolicy, setLearnerProfile, setTeachingApproach, setInstructorPersona, setDisciplineConventions, setPrerequisites } = useContextStore()
  const {
    setExtractionProgress,
    resetExtractionProgress,
    setIsExtracting,
    isExtracting,
    setError,
    error,
    clearError,
    markStepCompleted,
    startSession,
    setCurrentStep,
  } = useUIStore()

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const processContent = useCallback(async (text: string, fileName?: string) => {
    setIsExtracting(true)
    startSession()
    setSyllabusText(text, fileName)
    setError(null)

    try {
      // Stage 1: Parsing complete
      setExtractionProgress({ stage: 'parsing', progress: 10, message: 'Document parsed successfully' })

      // Stage 2: Extract metadata
      setExtractionProgress({ stage: 'metadata', progress: 25, message: 'Extracting course information...' })

      const metadataResponse = await fetch('/api/extract/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syllabusText: text }),
      })

      if (!metadataResponse.ok) {
        throw new Error('Failed to extract metadata')
      }

      const metadata = await metadataResponse.json()
      setCourse(metadata.course || {})
      setCoreCompetency(metadata.core_competency || {})

      // Stage 3: Extract modules
      setExtractionProgress({ stage: 'modules', progress: 50, message: 'Structuring learning modules...' })

      const modulesResponse = await fetch('/api/extract/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusText: text,
          courseTitle: metadata.course?.title,
        }),
      })

      if (!modulesResponse.ok) {
        throw new Error('Failed to extract modules')
      }

      const modulesData = await modulesResponse.json()
      setModules(modulesData.modules || [])

      // Stage 4: Extract knowledge graph
      setExtractionProgress({ stage: 'knowledge-graph', progress: 75, message: 'Building concept network...' })

      const kgResponse = await fetch('/api/extract/knowledge-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusText: text,
          modules: modulesData.modules,
        }),
      })

      if (!kgResponse.ok) {
        throw new Error('Failed to extract knowledge graph')
      }

      const kgData = await kgResponse.json()
      setNodes(kgData.nodes || [])
      setEdges(kgData.edges || [])
      setMetadata(kgData.metadata || {})

      // Complete
      setExtractionProgress({ stage: 'complete', progress: 100, message: 'Analysis complete!' })

      // Mark step completed and navigate
      markStepCompleted(1)

      // Wait a moment to show completion, then navigate
      setTimeout(() => {
        resetExtractionProgress()
        setIsExtracting(false)
        router.push('/unpack/competency')
      }, 1000)
    } catch (error) {
      console.error('Extraction error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      setExtractionProgress({ stage: 'error', progress: 0, message: 'Extraction failed' })
      setIsExtracting(false)
    }
  }, [
    setSyllabusText,
    setCourse,
    setCoreCompetency,
    setModules,
    setNodes,
    setEdges,
    setMetadata,
    setExtractionProgress,
    resetExtractionProgress,
    setIsExtracting,
    setError,
    markStepCompleted,
    startSession,
    router,
  ])

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setExtractionProgress({ stage: 'parsing', progress: 5, message: 'Parsing document...' })
      setIsExtracting(true)

      const result = await parseFile(file)
      await processContent(result.text, file.name)
    } catch (error) {
      console.error('File parse error:', error)
      setError(error instanceof Error ? error.message : 'Failed to parse file')
      setIsExtracting(false)
      resetExtractionProgress()
    }
  }, [processContent, setExtractionProgress, setIsExtracting, setError, resetExtractionProgress])

  // Switch to paste tab and load demo syllabus text
  const loadDemoText = useCallback(() => {
    setInputMethod('paste')
    setPasteText(demoSyllabusText)
    setIsDemoMode(true)
  }, [])

  // Run fake extraction animation for demo mode
  const processDemoContent = useCallback(async () => {
    setIsExtracting(true)
    startSession()
    setSyllabusText(demoSyllabusText, 'demo-syllabus.txt')
    setError(null)

    // Fake extraction stages with delays
    const stages = [
      { stage: 'parsing', progress: 10, message: 'Document parsed successfully', delay: 400 },
      { stage: 'metadata', progress: 25, message: 'Extracting course information...', delay: 600 },
      { stage: 'metadata', progress: 40, message: 'Found: Introduction to Data Science (DS 101)', delay: 500 },
      { stage: 'modules', progress: 50, message: 'Structuring learning modules...', delay: 600 },
      { stage: 'modules', progress: 65, message: 'Identified 7 modules', delay: 400 },
      { stage: 'knowledge-graph', progress: 75, message: 'Building concept network...', delay: 600 },
      { stage: 'knowledge-graph', progress: 90, message: 'Mapping 18 concepts and relationships', delay: 500 },
      { stage: 'complete', progress: 100, message: 'Analysis complete!', delay: 800 },
    ] as const

    for (const { stage, progress, message, delay } of stages) {
      setExtractionProgress({ stage, progress, message })
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    // Load all the demo data
    setCourse(demoCourse)
    setCoreCompetency(demoCoreCompetency)
    setModules(demoModules)
    setNodes(demoNodes)
    setEdges(demoEdges)
    setMetadata({ extraction_method: 'ai_extracted', is_dag_valid: true })
    setAIPolicy(demoAIPolicy)
    setLearnerProfile(demoLearnerProfile)
    setTeachingApproach(demoTeachingApproach)
    setInstructorPersona(demoInstructorPersona)
    setDisciplineConventions(demoDisciplineConventions)
    setPrerequisites(demoPrerequisites)

    // Mark step completed and navigate
    markStepCompleted(1)

    setTimeout(() => {
      resetExtractionProgress()
      setIsExtracting(false)
      setIsDemoMode(false)
      router.push('/unpack/competency')
    }, 1000)
  }, [
    setSyllabusText,
    setCourse,
    setCoreCompetency,
    setModules,
    setNodes,
    setEdges,
    setMetadata,
    setAIPolicy,
    setLearnerProfile,
    setTeachingApproach,
    setInstructorPersona,
    setDisciplineConventions,
    setPrerequisites,
    setExtractionProgress,
    resetExtractionProgress,
    setIsExtracting,
    setError,
    markStepCompleted,
    startSession,
    router,
  ])

  const handleTextSubmit = useCallback(async (text: string) => {
    // If in demo mode, use fake extraction
    if (isDemoMode && text === demoSyllabusText) {
      await processDemoContent()
      return
    }
    const result = parseText(text)
    await processContent(result.text)
  }, [processContent, isDemoMode, processDemoContent])

  // If already have syllabus text, show preview
  if (syllabusText && !isExtracting) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Syllabus</h1>
          <p className="text-gray-600 mt-1">
            Your syllabus has been uploaded. Continue to review the extracted information.
          </p>
        </div>

        <Card variant="bordered">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Syllabus uploaded</p>
                  <p className="text-sm text-gray-500">
                    {syllabusText.split(/\s+/).filter(Boolean).length.toLocaleString()} words
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  useCourseStore.getState().clearSyllabus()
                  useUIStore.getState().resetUI()
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Upload different file
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                {syllabusText.slice(0, 1000)}
                {syllabusText.length > 1000 && '...'}
              </pre>
            </div>
          </CardContent>
        </Card>

        <StepNavigation nextLabel="Continue to Competency" />
      </div>
    )
  }

  // Extraction in progress
  if (isExtracting) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analyzing Syllabus</h1>
          <p className="text-gray-600 mt-1">
            Our AI is extracting course structure and learning outcomes from your syllabus.
          </p>
        </div>

        <ExtractionProgressDisplay />
      </div>
    )
  }

  // Initial upload state
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Syllabus</h1>
        <p className="text-gray-600 mt-1">
          Upload your course syllabus to get started. We&apos;ll extract the structure and help you transform it into an AI-ready format.
        </p>
      </div>

      <Card variant="bordered">
        <CardContent className="p-6">
          <Tabs defaultValue="file" value={inputMethod} onValueChange={(v) => setInputMethod(v as 'file' | 'paste')}>
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="file">Upload File</TabsTrigger>
                <TabsTrigger value="paste">Paste Text</TabsTrigger>
              </TabsList>
              <button
                onClick={loadDemoText}
                className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Try Demo
              </button>
            </div>

            <TabsContent value="file">
              <FileDropzone
                onFileSelect={handleFileSelect}
                isLoading={isExtracting}
              />
            </TabsContent>

            <TabsContent value="paste">
              <PasteInput
                onTextSubmit={handleTextSubmit}
                isLoading={isExtracting}
                value={pasteText}
                onValueChange={(text) => {
                  setPasteText(text)
                  // If user edits demo text, exit demo mode
                  if (isDemoMode && text !== demoSyllabusText) {
                    setIsDemoMode(false)
                  }
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Extraction failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={clearError}
                className="text-sm text-red-600 hover:text-red-800 font-medium mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">What happens next?</p>
            <p className="text-sm text-blue-700 mt-1">
              We&apos;ll use AI to extract course metadata, learning objectives, topics, and assessments.
              You&apos;ll review and refine everything before finalizing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
