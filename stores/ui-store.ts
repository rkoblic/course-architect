import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UnpackStep = 1 | 2 | 3 | 4 | 5 | 6
export type AssessStep = 1 | 2 | 3 | 4 | 5
export type AppMode = 'unpack' | 'assess'

export interface ExtractionProgress {
  stage: 'idle' | 'parsing' | 'metadata' | 'modules' | 'knowledge-graph' | 'complete' | 'error'
  progress: number // 0-100
  message: string
}

interface UIState {
  // Current mode
  currentMode: AppMode

  // Current step in unpack flow
  currentStep: UnpackStep

  // Step completion status
  stepsCompleted: Record<UnpackStep, boolean>

  // Current step in assess flow
  assessCurrentStep: AssessStep

  // Assess step completion status
  assessStepsCompleted: Record<AssessStep, boolean>

  // Extraction progress
  extractionProgress: ExtractionProgress

  // Loading states
  isExtracting: boolean
  isSaving: boolean

  // Error state
  error: string | null

  // View preferences
  exportViewMode: 'instructor' | 'json' | 'graph'

  // Session info
  sessionStartedAt: string | null
  lastModifiedAt: string | null

  // Mode actions
  setCurrentMode: (mode: AppMode) => void

  // Unpack actions
  setCurrentStep: (step: UnpackStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  markStepCompleted: (step: UnpackStep) => void
  markStepIncomplete: (step: UnpackStep) => void

  // Assess actions
  setAssessCurrentStep: (step: AssessStep) => void
  goToNextAssessStep: () => void
  goToPreviousAssessStep: () => void
  markAssessStepCompleted: (step: AssessStep) => void
  markAssessStepIncomplete: (step: AssessStep) => void

  setExtractionProgress: (progress: Partial<ExtractionProgress>) => void
  resetExtractionProgress: () => void

  setIsExtracting: (isExtracting: boolean) => void
  setIsSaving: (isSaving: boolean) => void

  setError: (error: string | null) => void
  clearError: () => void

  setExportViewMode: (mode: 'instructor' | 'json' | 'graph') => void

  startSession: () => void
  updateLastModified: () => void

  resetUI: () => void
  resetAssessUI: () => void
  resetAll: () => void
}

const initialExtractionProgress: ExtractionProgress = {
  stage: 'idle',
  progress: 0,
  message: '',
}

const initialAssessStepsCompleted: Record<AssessStep, boolean> = {
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
}

const initialState = {
  currentMode: 'unpack' as AppMode,
  currentStep: 1 as UnpackStep,
  stepsCompleted: {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  },
  assessCurrentStep: 1 as AssessStep,
  assessStepsCompleted: initialAssessStepsCompleted,
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

      setCurrentMode: (mode) => set({ currentMode: mode }),

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

      // Assess actions
      setAssessCurrentStep: (step) => set({ assessCurrentStep: step }),

      goToNextAssessStep: () =>
        set((state) => ({
          assessCurrentStep: Math.min(state.assessCurrentStep + 1, 5) as AssessStep,
        })),

      goToPreviousAssessStep: () =>
        set((state) => ({
          assessCurrentStep: Math.max(state.assessCurrentStep - 1, 1) as AssessStep,
        })),

      markAssessStepCompleted: (step) =>
        set((state) => ({
          assessStepsCompleted: { ...state.assessStepsCompleted, [step]: true },
          lastModifiedAt: new Date().toISOString(),
        })),

      markAssessStepIncomplete: (step) =>
        set((state) => ({
          assessStepsCompleted: { ...state.assessStepsCompleted, [step]: false },
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

      resetAssessUI: () =>
        set({
          assessCurrentStep: 1,
          assessStepsCompleted: initialAssessStepsCompleted,
          error: null,
        }),

      resetAll: () => set(initialState),
    }),
    {
      name: 'course-architect-ui',
    }
  )
)

// Step labels for the Unpack stepper
export const STEP_LABELS: Record<UnpackStep, { title: string; description: string }> = {
  1: { title: 'Upload', description: 'Upload your syllabus' },
  2: { title: 'Competency', description: 'Define core competency' },
  3: { title: 'Modules', description: 'Structure learning modules' },
  4: { title: 'Prerequisites', description: 'Map dependencies' },
  5: { title: 'Context', description: 'Add course context' },
  6: { title: 'Export', description: 'Review and export' },
}

// Step labels for the Assess stepper
export const ASSESS_STEP_LABELS: Record<AssessStep, { title: string; description: string }> = {
  1: { title: 'Inventory', description: 'Catalog assessments' },
  2: { title: 'Audit', description: 'Analyze AI vulnerability' },
  3: { title: 'Alternatives', description: 'Generate authentic options' },
  4: { title: 'Rubrics', description: 'Build AI-era rubrics' },
  5: { title: 'Export', description: 'Review and export' },
}
