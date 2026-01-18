import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Rubric, RubricCriterion, RubricLevel, RubricCategory } from '@/types/schema'

interface RubricState {
  // Rubrics map (keyed by rubric ID)
  rubrics: Map<string, Rubric>

  // Currently selected rubric for editing
  selectedRubricId: string | null

  // Loading states
  isGenerating: boolean

  // Actions - CRUD for rubrics
  setRubrics: (rubrics: Rubric[]) => void
  addRubric: (rubric: Rubric) => void
  updateRubric: (id: string, updates: Partial<Rubric>) => void
  removeRubric: (id: string) => void
  clearRubrics: () => void

  // Get rubric by assessment ID
  getRubricForAssessment: (assessmentId: string) => Rubric | undefined

  // Selection
  setSelectedRubricId: (id: string | null) => void

  // Actions - CRUD for criteria
  addCriterion: (rubricId: string, criterion: RubricCriterion) => void
  updateCriterion: (rubricId: string, criterionIndex: number, updates: Partial<RubricCriterion>) => void
  removeCriterion: (rubricId: string, criterionIndex: number) => void
  reorderCriteria: (rubricId: string, sourceIndex: number, destinationIndex: number) => void

  // Actions - CRUD for levels within a criterion
  addLevel: (rubricId: string, criterionIndex: number, level: RubricLevel) => void
  updateLevel: (rubricId: string, criterionIndex: number, levelIndex: number, updates: Partial<RubricLevel>) => void
  removeLevel: (rubricId: string, criterionIndex: number, levelIndex: number) => void

  // Loading states
  setIsGenerating: (isGenerating: boolean) => void

  // Reset
  reset: () => void
}

// Helper to generate rubric ID
export function generateRubricId(): string {
  return `rubric-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Default levels for a new criterion
export const DEFAULT_RUBRIC_LEVELS: RubricLevel[] = [
  { name: 'Exemplary', points: 4, description: '' },
  { name: 'Proficient', points: 3, description: '' },
  { name: 'Developing', points: 2, description: '' },
  { name: 'Beginning', points: 1, description: '' },
]

// AI-era rubric categories with descriptions
export const RUBRIC_CATEGORIES: { value: RubricCategory; label: string; description: string }[] = [
  { value: 'content_mastery', label: 'Content Mastery', description: 'Understanding of core concepts and knowledge' },
  { value: 'process_quality', label: 'Process Quality', description: 'Quality of thinking, methodology, and approach' },
  { value: 'metacognition', label: 'Metacognition', description: 'Self-awareness, reflection, and learning transfer' },
  { value: 'ai_collaboration', label: 'AI Collaboration', description: 'Effective and ethical use of AI tools' },
  { value: 'authentic_voice', label: 'Authentic Voice', description: 'Personal perspective, original thinking, lived experience' },
  { value: 'contextual_application', label: 'Contextual Application', description: 'Connection to real-world, local, or current contexts' },
]

const initialState = {
  rubrics: new Map<string, Rubric>(),
  selectedRubricId: null,
  isGenerating: false,
}

export const useRubricStore = create<RubricState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setRubrics: (rubrics) =>
        set({
          rubrics: new Map(rubrics.map((r) => [r.id, r])),
        }),

      addRubric: (rubric) =>
        set((state) => {
          const newRubrics = new Map(state.rubrics)
          newRubrics.set(rubric.id, rubric)
          return { rubrics: newRubrics }
        }),

      updateRubric: (id, updates) =>
        set((state) => {
          const rubric = state.rubrics.get(id)
          if (!rubric) return state
          const newRubrics = new Map(state.rubrics)
          newRubrics.set(id, { ...rubric, ...updates })
          return { rubrics: newRubrics }
        }),

      removeRubric: (id) =>
        set((state) => {
          const newRubrics = new Map(state.rubrics)
          newRubrics.delete(id)
          return {
            rubrics: newRubrics,
            selectedRubricId:
              state.selectedRubricId === id ? null : state.selectedRubricId,
          }
        }),

      clearRubrics: () =>
        set({
          rubrics: new Map(),
          selectedRubricId: null,
        }),

      getRubricForAssessment: (assessmentId) => {
        const rubrics = get().rubrics
        for (const rubric of rubrics.values()) {
          if (rubric.assessment_id === assessmentId) {
            return rubric
          }
        }
        return undefined
      },

      setSelectedRubricId: (id) => set({ selectedRubricId: id }),

      // Criterion CRUD
      addCriterion: (rubricId, criterion) =>
        set((state) => {
          const rubric = state.rubrics.get(rubricId)
          if (!rubric) return state
          const newRubrics = new Map(state.rubrics)
          newRubrics.set(rubricId, {
            ...rubric,
            criteria: [...rubric.criteria, criterion],
          })
          return { rubrics: newRubrics }
        }),

      updateCriterion: (rubricId, criterionIndex, updates) =>
        set((state) => {
          const rubric = state.rubrics.get(rubricId)
          if (!rubric || criterionIndex >= rubric.criteria.length) return state
          const newCriteria = [...rubric.criteria]
          newCriteria[criterionIndex] = { ...newCriteria[criterionIndex], ...updates }
          const newRubrics = new Map(state.rubrics)
          newRubrics.set(rubricId, { ...rubric, criteria: newCriteria })
          return { rubrics: newRubrics }
        }),

      removeCriterion: (rubricId, criterionIndex) =>
        set((state) => {
          const rubric = state.rubrics.get(rubricId)
          if (!rubric || criterionIndex >= rubric.criteria.length) return state
          const newCriteria = rubric.criteria.filter((_, i) => i !== criterionIndex)
          const newRubrics = new Map(state.rubrics)
          newRubrics.set(rubricId, { ...rubric, criteria: newCriteria })
          return { rubrics: newRubrics }
        }),

      reorderCriteria: (rubricId, sourceIndex, destinationIndex) =>
        set((state) => {
          const rubric = state.rubrics.get(rubricId)
          if (!rubric) return state
          const newCriteria = [...rubric.criteria]
          const [removed] = newCriteria.splice(sourceIndex, 1)
          newCriteria.splice(destinationIndex, 0, removed)
          const newRubrics = new Map(state.rubrics)
          newRubrics.set(rubricId, { ...rubric, criteria: newCriteria })
          return { rubrics: newRubrics }
        }),

      // Level CRUD
      addLevel: (rubricId, criterionIndex, level) =>
        set((state) => {
          const rubric = state.rubrics.get(rubricId)
          if (!rubric || criterionIndex >= rubric.criteria.length) return state
          const newCriteria = [...rubric.criteria]
          newCriteria[criterionIndex] = {
            ...newCriteria[criterionIndex],
            levels: [...newCriteria[criterionIndex].levels, level],
          }
          const newRubrics = new Map(state.rubrics)
          newRubrics.set(rubricId, { ...rubric, criteria: newCriteria })
          return { rubrics: newRubrics }
        }),

      updateLevel: (rubricId, criterionIndex, levelIndex, updates) =>
        set((state) => {
          const rubric = state.rubrics.get(rubricId)
          if (!rubric || criterionIndex >= rubric.criteria.length) return state
          const criterion = rubric.criteria[criterionIndex]
          if (levelIndex >= criterion.levels.length) return state
          const newLevels = [...criterion.levels]
          newLevels[levelIndex] = { ...newLevels[levelIndex], ...updates }
          const newCriteria = [...rubric.criteria]
          newCriteria[criterionIndex] = { ...criterion, levels: newLevels }
          const newRubrics = new Map(state.rubrics)
          newRubrics.set(rubricId, { ...rubric, criteria: newCriteria })
          return { rubrics: newRubrics }
        }),

      removeLevel: (rubricId, criterionIndex, levelIndex) =>
        set((state) => {
          const rubric = state.rubrics.get(rubricId)
          if (!rubric || criterionIndex >= rubric.criteria.length) return state
          const criterion = rubric.criteria[criterionIndex]
          if (levelIndex >= criterion.levels.length) return state
          const newLevels = criterion.levels.filter((_, i) => i !== levelIndex)
          const newCriteria = [...rubric.criteria]
          newCriteria[criterionIndex] = { ...criterion, levels: newLevels }
          const newRubrics = new Map(state.rubrics)
          newRubrics.set(rubricId, { ...rubric, criteria: newCriteria })
          return { rubrics: newRubrics }
        }),

      setIsGenerating: (isGenerating) => set({ isGenerating }),

      reset: () =>
        set({
          rubrics: new Map(),
          selectedRubricId: null,
          isGenerating: false,
        }),
    }),
    {
      name: 'course-architect-rubrics',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const data = JSON.parse(str)
          return {
            ...data,
            state: {
              ...data.state,
              rubrics: new Map(data.state.rubrics || []),
            },
          }
        },
        setItem: (name, value) => {
          const data = {
            ...value,
            state: {
              ...value.state,
              rubrics: Array.from(value.state.rubrics.entries()),
            },
          }
          localStorage.setItem(name, JSON.stringify(data))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
