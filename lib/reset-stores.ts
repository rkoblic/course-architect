import { useCourseStore } from '@/stores/course-store'
import { useModuleStore } from '@/stores/module-store'
import { useKnowledgeGraphStore } from '@/stores/knowledge-graph-store'
import { useContextStore } from '@/stores/context-store'
import { useUIStore } from '@/stores/ui-store'

/**
 * Resets all Zustand stores to their initial state.
 * Call this when starting a fresh session (e.g., clicking Unpack from home page).
 */
export function resetAllStores() {
  useCourseStore.getState().reset()
  useModuleStore.getState().reset()
  useKnowledgeGraphStore.getState().reset()
  useContextStore.getState().reset()
  useUIStore.getState().resetAll()
}
