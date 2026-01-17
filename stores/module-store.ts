import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Module } from '@/types/schema'

interface ModuleState {
  // Modules array
  modules: Module[]

  // Actions
  setModules: (modules: Module[]) => void
  addModule: (module: Module) => void
  updateModule: (id: string, updates: Partial<Module>) => void
  removeModule: (id: string) => void
  reorderModules: (sourceIndex: number, destinationIndex: number) => void
  confirmModule: (id: string) => void
  reset: () => void
}

const initialState = {
  modules: [],
}

// Helper to generate module ID
export function generateModuleId(): string {
  return `module-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Helper to resequence modules
function resequenceModules(modules: Module[]): Module[] {
  return modules.map((module, index) => ({
    ...module,
    sequence: index + 1,
  }))
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set) => ({
      ...initialState,

      setModules: (modules) =>
        set({ modules: resequenceModules(modules) }),

      addModule: (module) =>
        set((state) => ({
          modules: resequenceModules([...state.modules, module]),
        })),

      updateModule: (id, updates) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      removeModule: (id) =>
        set((state) => ({
          modules: resequenceModules(
            state.modules.filter((m) => m.id !== id)
          ),
        })),

      reorderModules: (sourceIndex, destinationIndex) =>
        set((state) => {
          const newModules = [...state.modules]
          const [removed] = newModules.splice(sourceIndex, 1)
          newModules.splice(destinationIndex, 0, removed)
          return { modules: resequenceModules(newModules) }
        }),

      confirmModule: (id) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, confirmed: true } : m
          ),
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'course-architect-modules',
    }
  )
)
