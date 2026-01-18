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
 * Resets Assess mode stores while preserving assessments extracted from Unpack.
 * Call this when transitioning from Unpack to Assess mode.
 * - Preserves assessments but clears vulnerability audits and alternatives
 * - Resets rubrics
 * - Resets Assess UI state
 */
export function resetAssessStores() {
  // Don't reset assessments entirely - preserve from Unpack!
  // Only clear Assess-specific data (audits, alternatives)
  useAssessmentStore.getState().clearAlternativesAndAudits()
  useRubricStore.getState().reset()
  useUIStore.getState().resetAssessUI()
}
