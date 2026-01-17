import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Course, CoreCompetency } from '@/types/schema'

interface CourseState {
  // Raw syllabus text
  syllabusText: string | null
  syllabusFileName: string | null

  // Course metadata
  course: Partial<Course>

  // Core competency
  coreCompetency: Partial<CoreCompetency>

  // Actions
  setSyllabusText: (text: string, fileName?: string) => void
  clearSyllabus: () => void
  setCourse: (course: Partial<Course>) => void
  updateCourse: (updates: Partial<Course>) => void
  setCoreCompetency: (competency: Partial<CoreCompetency>) => void
  updateCoreCompetency: (updates: Partial<CoreCompetency>) => void
  reset: () => void
}

const initialState = {
  syllabusText: null,
  syllabusFileName: null,
  course: {},
  coreCompetency: {},
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      ...initialState,

      setSyllabusText: (text, fileName) =>
        set({
          syllabusText: text,
          syllabusFileName: fileName || null,
        }),

      clearSyllabus: () =>
        set({
          syllabusText: null,
          syllabusFileName: null,
        }),

      setCourse: (course) => set({ course }),

      updateCourse: (updates) =>
        set((state) => ({
          course: { ...state.course, ...updates },
        })),

      setCoreCompetency: (competency) => set({ coreCompetency: competency }),

      updateCoreCompetency: (updates) =>
        set((state) => ({
          coreCompetency: { ...state.coreCompetency, ...updates },
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'course-architect-course',
    }
  )
)
