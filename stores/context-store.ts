import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AIPolicy,
  LearnerProfile,
  TeachingApproachContext,
  InstructorPersona,
  DisciplineConventions,
  Prerequisites,
  Context,
} from '@/types/schema'

interface ContextState {
  // AI Policy (required)
  aiPolicy: Partial<AIPolicy>

  // Learner Profile
  learnerProfile: Partial<LearnerProfile>

  // Teaching Approach
  teachingApproach: Partial<TeachingApproachContext>

  // Instructor Persona
  instructorPersona: Partial<InstructorPersona>

  // Discipline Conventions
  disciplineConventions: Partial<DisciplineConventions>

  // Prerequisites
  prerequisites: Partial<Prerequisites>

  // Actions
  setAIPolicy: (policy: Partial<AIPolicy>) => void
  updateAIPolicy: (updates: Partial<AIPolicy>) => void

  setLearnerProfile: (profile: Partial<LearnerProfile>) => void
  updateLearnerProfile: (updates: Partial<LearnerProfile>) => void

  setTeachingApproach: (approach: Partial<TeachingApproachContext>) => void
  updateTeachingApproach: (updates: Partial<TeachingApproachContext>) => void

  setInstructorPersona: (persona: Partial<InstructorPersona>) => void
  updateInstructorPersona: (updates: Partial<InstructorPersona>) => void

  setDisciplineConventions: (conventions: Partial<DisciplineConventions>) => void
  updateDisciplineConventions: (updates: Partial<DisciplineConventions>) => void

  setPrerequisites: (prereqs: Partial<Prerequisites>) => void
  updatePrerequisites: (updates: Partial<Prerequisites>) => void

  // Get complete context object
  getContext: () => Context

  // Reset
  reset: () => void
}

const initialState = {
  aiPolicy: {},
  learnerProfile: {},
  teachingApproach: {},
  instructorPersona: {},
  disciplineConventions: {},
  prerequisites: {},
}

export const useContextStore = create<ContextState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // AI Policy
      setAIPolicy: (policy) => set({ aiPolicy: policy }),
      updateAIPolicy: (updates) =>
        set((state) => ({
          aiPolicy: { ...state.aiPolicy, ...updates },
        })),

      // Learner Profile
      setLearnerProfile: (profile) => set({ learnerProfile: profile }),
      updateLearnerProfile: (updates) =>
        set((state) => ({
          learnerProfile: { ...state.learnerProfile, ...updates },
        })),

      // Teaching Approach
      setTeachingApproach: (approach) => set({ teachingApproach: approach }),
      updateTeachingApproach: (updates) =>
        set((state) => ({
          teachingApproach: { ...state.teachingApproach, ...updates },
        })),

      // Instructor Persona
      setInstructorPersona: (persona) => set({ instructorPersona: persona }),
      updateInstructorPersona: (updates) =>
        set((state) => ({
          instructorPersona: { ...state.instructorPersona, ...updates },
        })),

      // Discipline Conventions
      setDisciplineConventions: (conventions) => set({ disciplineConventions: conventions }),
      updateDisciplineConventions: (updates) =>
        set((state) => ({
          disciplineConventions: { ...state.disciplineConventions, ...updates },
        })),

      // Prerequisites
      setPrerequisites: (prereqs) => set({ prerequisites: prereqs }),
      updatePrerequisites: (updates) =>
        set((state) => ({
          prerequisites: { ...state.prerequisites, ...updates },
        })),

      // Get complete context
      getContext: () => {
        const state = get()
        return {
          ai_policy: state.aiPolicy as AIPolicy,
          learner_profile: Object.keys(state.learnerProfile).length > 0 ? state.learnerProfile : undefined,
          teaching_approach: Object.keys(state.teachingApproach).length > 0 ? state.teachingApproach : undefined,
          instructor_persona: Object.keys(state.instructorPersona).length > 0 ? state.instructorPersona : undefined,
          discipline_conventions: Object.keys(state.disciplineConventions).length > 0 ? state.disciplineConventions : undefined,
        } as Context
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'course-architect-context',
    }
  )
)
