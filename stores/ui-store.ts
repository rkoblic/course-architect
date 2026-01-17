import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UnpackStep = 1 | 2 | 3 | 4 | 5 | 6

export interface ExtractionProgress {
  stage: 'idle' | 'parsing' | 'metadata' | 'modules' | 'knowledge-graph' | 'complete' | 'error'
  progress: number // 0-100
  message: string
}

interface UIState {
  // Current step in unpack flow
  currentStep: UnpackStep

  // Step completion status
  stepsCompleted: Record<UnpackStep, boolean>

  // Extraction progress
  extractionProgress: ExtractionProgress

  // Loading states
  isExtracting: boolean
  isSaving: boolean

  // Error state
  error: string | null

  // View preferences
  exportViewMode: 'instructor' | 'json'

  // Session info
  sessionStartedAt: string | null
  lastModifiedAt: string | null

  // Actions
  setCurrentStep: (step: UnpackStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  markStepCompleted: (step: UnpackStep) => void
  markStepIncomplete: (step: UnpackStep) => void

  setExtractionProgress: (progress: Partial<ExtractionProgress>) => void
  resetExtractionProgress: () => void

  setIsExtracting: (isExtracting: boolean) => void
  setIsSaving: (isSaving: boolean) => void

  setError: (error: string | null) => void
  clearError: () => void

  setExportViewMode: (mode: 'instructor' | 'json') => void

  startSession: () => void
  updateLastModified: () => void

  resetUI: () => void
  resetAll: () => void
}

const initialExtractionProgress: ExtractionProgress = {
  stage: 'idle',
  progress: 0,
  message: '',
}

const initialState = {
  currentStep: 1 as UnpackStep,
  stepsCompleted: {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  },
  extractionProgress: initialExtractionProgress,
  isExtracting: false,
  isSaving: false,
  error: null,
  exportViewMode: 'instructor' as const,
  sessionStartedAt: null,
  lastModifiedAt: null,
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      goToNextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 6) as UnpackStep,
        })),

      goToPreviousStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1) as UnpackStep,
        })),

      markStepCompleted: (step) =>
        set((state) => ({
          stepsCompleted: { ...state.stepsCompleted, [step]: true },
          lastModifiedAt: new Date().toISOString(),
        })),

      markStepIncomplete: (step) =>
        set((state) => ({
          stepsCompleted: { ...state.stepsCompleted, [step]: false },
        })),

      setExtractionProgress: (progress) =>
        set((state) => ({
          extractionProgress: { ...state.extractionProgress, ...progress },
        })),

      resetExtractionProgress: () =>
        set({ extractionProgress: initialExtractionProgress }),

      setIsExtracting: (isExtracting) => set({ isExtracting }),
      setIsSaving: (isSaving) => set({ isSaving }),

      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      setExportViewMode: (mode) => set({ exportViewMode: mode }),

      startSession: () =>
        set({
          sessionStartedAt: new Date().toISOString(),
          lastModifiedAt: new Date().toISOString(),
        }),

      updateLastModified: () =>
        set({ lastModifiedAt: new Date().toISOString() }),

      resetUI: () =>
        set({
          currentStep: 1,
          stepsCompleted: initialState.stepsCompleted,
          extractionProgress: initialExtractionProgress,
          isExtracting: false,
          isSaving: false,
          error: null,
        }),

      resetAll: () => set(initialState),
    }),
    {
      name: 'course-architect-ui',
    }
  )
)

// Step labels for the stepper
export const STEP_LABELS: Record<UnpackStep, { title: string; description: string }> = {
  1: { title: 'Upload', description: 'Upload your syllabus' },
  2: { title: 'Competency', description: 'Define core competency' },
  3: { title: 'Modules', description: 'Structure learning modules' },
  4: { title: 'Prerequisites', description: 'Map dependencies' },
  5: { title: 'Context', description: 'Add course context' },
  6: { title: 'Export', description: 'Review and export' },
}
