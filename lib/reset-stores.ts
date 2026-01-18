import { useCourseStore } from '@/stores/course-store'
import { useModuleStore } from '@/stores/module-store'
import { useKnowledgeGraphStore } from '@/stores/knowledge-graph-store'
import { useContextStore } from '@/stores/context-store'
import { useUIStore } from '@/stores/ui-store'
import { useAssessmentStore } from '@/stores/assessment-store'
import { useRubricStore } from '@/stores/rubric-store'

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
  useAssessmentStore.getState().reset()
  useRubricStore.getState().reset()
}

/**
 * Resets only the Assess mode stores.
 * Call this when starting a fresh Assess session while preserving Unpack data.
 */
export function resetAssessStores() {
  useAssessmentStore.getState().reset()
  useRubricStore.getState().reset()
  useUIStore.getState().resetAssessUI()
}
