# CLAUDE.md

This file provides context for Claude Code when working on this project.

## Project Overview

Course Architect is a Next.js web app that helps higher education faculty transform syllabi into AI-ready curriculum structures. It has two modes:

1. **Unpack Mode** (functional): Transform syllabi into structured, machine-readable formats
2. **Assess Mode** (functional): Audit assessments for AI vulnerability and generate alternatives

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: Zustand stores with persistence
- **AI**: Anthropic Claude API for extraction
- **File Parsing**: mammoth (DOCX), plain text (PDF temporarily disabled)

## Project Structure

```
app/
  page.tsx              # Home page with mode selection
  layout.tsx            # Root layout
  globals.css           # Tailwind + CSS variables
  unpack/               # Unpack mode pages (7 steps)
    page.tsx            # Step 1: Upload & extract
    competency/         # Step 2: Core competency
    modules/            # Step 3: Edit modules
    assessments/        # Step 4: Review assessments
    prerequisites/      # Step 5: Map prerequisites (with AI suggestions)
    context/            # Step 6: AI policy & context
    export/             # Step 7: Review & export JSON
  assess/               # Assess mode pages (5 steps)
    layout.tsx          # Assess layout with stepper
    page.tsx            # Step 1: Assessment Inventory
    audit/              # Step 2: Vulnerability Audit
    alternatives/       # Step 3: Alternative Generator
    rubrics/            # Step 4: Rubric Builder
    export/             # Step 5: Review & Export
  api/
    parse/              # File parsing endpoint
    extract/
      metadata/         # Course metadata extraction
      modules/          # Module extraction
      assessments/      # Assessment extraction from syllabus
      knowledge-graph/  # Knowledge graph extraction (legacy single-call)
        nodes/          # Node extraction (step 1 of split extraction)
        edges/          # Edge extraction (step 2, uses node IDs)
    suggest/
      prerequisites/    # AI prerequisite suggestions
    generate/
      assessments/      # AI assessment generation from course structure
    assess/
      vulnerability-audit/    # AI vulnerability analysis
      generate-alternatives/  # AI alternative generation
      generate-rubric/        # AI rubric generation

components/
  ui/                   # Base UI components (Card, Tabs, Button, etc.)
  layout/               # Layout components (StepNavigation, Header, Stepper, AssessStepper)
  upload/               # Upload components (FileDropzone, PasteInput, ExtractionProgress)
  assess/               # Assess mode components
    AssessmentCard.tsx  # Assessment display card
    AssessmentForm.tsx  # Assessment CRUD form
    VulnerabilityBadge.tsx  # Risk level badge + detail view
    AlternativeCard.tsx # Alternative assessment card
    RubricEditor.tsx    # Rubric criteria/levels editor

stores/
  course-store.ts       # Course metadata & core competency
  module-store.ts       # Learning modules (array)
  knowledge-graph-store.ts  # Nodes & edges (Maps, not arrays!)
  context-store.ts      # AI policy, learner profile, prerequisites
  ui-store.ts           # UI state, extraction progress, step tracking (both modes)
  assessment-store.ts   # Assessments, vulnerability audits, alternatives (Maps)
  rubric-store.ts       # Rubrics with criteria and levels (Maps)

lib/
  anthropic.ts          # Claude API client
  parsers/              # DOCX parser (PDF disabled)
  prompts/              # AI extraction prompts
    vulnerability-audit.ts      # Vulnerability analysis prompt
    alternative-generation.ts   # Alternative generation prompt
    rubric-generation.ts        # Rubric generation prompt
    assessment-extraction.ts    # Assessment extraction prompt
    assessment-generation.ts    # Assessment generation from course structure
  utils.ts              # Utility functions (cn for classnames)
  reset-stores.ts       # Store reset functions (resetUnpackStores, resetAssessStores)

types/
  schema.ts             # TypeScript types matching schema-v0.4.json
```

## Critical Type Information

### Module Type (types/schema.ts)
```typescript
interface Module {
  id: string
  sequence: number
  title: string
  description?: string
  learning_outcome: string      // Single string, NOT an array
  bloom_level: BloomLevel       // Required
  ai_partnership_mode: AIPartnershipMode  // Required
  topics?: string[]
  estimated_duration?: string
  concept_ids?: string[]
  assessment_ids?: string[]
}
```

### AIPolicy Type (types/schema.ts)
```typescript
interface AIPolicy {
  course_level: AIPolicyLevel   // Required
  rationale?: string
  details?: string
  skills_to_develop?: string[]
  skills_to_delegate?: string[]
  // NOTE: No assessment_overrides field!
}
```

### Knowledge Graph Store (stores/knowledge-graph-store.ts)
**IMPORTANT**: Uses Maps, not arrays!
```typescript
nodes: Map<string, KnowledgeNode>  // Use .size not .length
edges: Map<string, KnowledgeEdge>  // Use .size not .length

// To convert to array for JSON export:
Array.from(nodes.values())
Array.from(edges.values())
```

### Assessment Store (stores/assessment-store.ts)
**IMPORTANT**: Uses Maps, not arrays!
```typescript
assessments: Map<string, Assessment>
alternatives: Map<string, AlternativeAssessment[]>  // keyed by assessment ID
selectedAssessmentId: string | null

// Vulnerability audit is stored on the Assessment object:
interface Assessment {
  id: string
  name: string
  type: AssessmentType
  weight?: number
  vulnerability_audit?: VulnerabilityAudit  // 5-dimension analysis
  // ...
}
```

### Rubric Store (stores/rubric-store.ts)
**IMPORTANT**: Uses Maps, not arrays!
```typescript
rubrics: Map<string, Rubric>

interface Rubric {
  id: string
  assessment_id: string
  criteria: RubricCriterion[]  // Array of criteria
}

interface RubricCriterion {
  name: string
  weight: number
  category?: RubricCategory  // AI-era categories
  levels: RubricLevel[]      // Performance levels (Exemplary, Proficient, etc.)
}
```

### UI Store State (stores/ui-store.ts)
```typescript
type UnpackStep = 1 | 2 | 3 | 4 | 5 | 6 | 7  // 7 steps in Unpack mode
type AssessStep = 1 | 2 | 3 | 4 | 5
type AppMode = 'unpack' | 'assess'

// Unpack-specific state:
currentStep: UnpackStep
stepsCompleted: Record<UnpackStep, boolean>

// Assess-specific state:
currentMode: AppMode
assessCurrentStep: AssessStep
assessStepsCompleted: Record<AssessStep, boolean>

// Constants:
STEP_LABELS: Record<UnpackStep, { title: string; description: string }>
ASSESS_STEP_LABELS: Record<AssessStep, { title: string; description: string }>
```

### StepNavigation Props (components/layout/step-navigation.tsx)
```typescript
interface StepNavigationProps {
  className?: string
  onNext?: () => void | Promise<void>
  onBack?: () => void
  nextLabel?: string
  backLabel?: string      // NOT prevLabel!
  nextDisabled?: boolean
  isLoading?: boolean
  showBack?: boolean
  showNext?: boolean
}
```

## Common Pitfalls to Avoid

1. **Maps vs Arrays**: Knowledge graph store uses `Map<string, T>` for nodes/edges
   - Use `.size` not `.length`
   - Convert with `Array.from(map.values())` for JSON

2. **Module fields**: The schema uses `learning_outcome` (singular string), not `learning_objectives` (array)

3. **AIPolicy fields**: Does NOT have `assessment_overrides` - use `skills_to_develop` and `skills_to_delegate`

4. **StepNavigation**: The back button label prop is `backLabel`, not `prevLabel`

5. **Always run type check before committing**: `npx tsc --noEmit`

## Development Commands

```bash
npm run dev      # Start dev server (port 3000 or 3001)
npm run build    # Production build (runs type checking)
npm run lint     # ESLint
npx tsc --noEmit # Type check without building (run before commits!)
```

## Design Principles

1. **Faculty as Architect**: Faculty control every decision; AI offers suggestions
2. **Progressive Disclosure**: Start simple, reveal complexity when needed
3. **Dual Legibility**: Output readable by both humans and machines

## Unpack Flow (7 Steps)

1. **Upload** (`/unpack`): Upload DOCX/TXT or paste syllabus text
2. **Competency** (`/unpack/competency`): Define core competency
3. **Modules** (`/unpack/modules`): Review and edit learning modules
4. **Assessments** (`/unpack/assessments`): Review extracted assessments, generate if needed
5. **Prerequisites** (`/unpack/prerequisites`): Map required skills/knowledge (has AI suggestions)
6. **Context** (`/unpack/context`): Set AI policy and learner profile
7. **Export** (`/unpack/export`): Review and download JSON

## Assess Flow (5 Steps)

1. **Inventory** (`/assess`): Catalog existing assessments (manual entry or extract from syllabus)
2. **Audit** (`/assess/audit`): AI vulnerability analysis across 5 dimensions:
   - Reproducibility: Could AI generate a plausible response?
   - Verification: Can you verify student did the work?
   - Uniqueness: Does it require student-specific input?
   - Temporal: Are time constraints effective?
   - Embodied: Does it require physical presence?
3. **Alternatives** (`/assess/alternatives`): Generate authentic alternatives using 4 principles:
   - Requires what AI lacks (lived experience, relationships, embodied knowledge)
   - Makes process visible (iterative drafts, oral defense, metacognition)
   - Leverages AI as tool (AI collaboration is part of task)
   - Anchors to specifics (local context, current events, peer interaction)
4. **Rubrics** (`/assess/rubrics`): Build AI-era rubrics with 6 categories:
   - content_mastery, process_quality, metacognition
   - ai_collaboration, authentic_voice, contextual_application
5. **Export** (`/assess/export`): Review and download assessment package JSON

### Entry Points to Assess Mode
- **Continue from Unpack**: Button on export page preserves all course data
- **Start Fresh**: Home page Assess card for manual entry
- **Import JSON**: Upload previous Unpack export (future)

## Current State

- Home page with Unpack/Assess mode selection complete (with logo)
- Full Unpack flow implemented (all 7 steps, including assessments)
- Full Assess flow implemented (all 5 steps)
- AI extraction pipeline for metadata, modules, knowledge graph, and assessments
- AI suggestions for prerequisites (auto-triggered on step 5)
- AI assessment generation from course structure
- AI vulnerability audit, alternative generation, and rubric generation
- Assessments extracted in Unpack flow carry over to Assess mode
- Export pages with JSON download and interactive knowledge graph visualization
- DOCX parsing via server-side API (PDF temporarily disabled)

## Recent Changes (January 2026)

### Assessment Integration in Unpack Flow
Integrated assessment extraction into the Unpack pipeline so assessments carry over automatically to Assess mode.

**Unpack Flow Changes (6 → 7 steps):**
- Added new Step 4: Assessments (`/unpack/assessments`)
- Steps 4-6 renumbered to 5-7 (Prerequisites, Context, Export)
- Assessment extraction added to upload pipeline after knowledge graph
- "Generate from Course Structure" option for syllabi with thin assessment data

**New Files:**
- `app/unpack/assessments/page.tsx`: New Assessments step UI
- `app/api/generate/assessments/route.ts`: AI assessment generation endpoint
- `lib/prompts/assessment-generation.ts`: Generation prompt for AI-aligned assessments

**Store Changes:**
- `ui-store.ts`: UnpackStep now 1-7, STEP_LABELS updated
- `assessment-store.ts`: Added `clearAlternativesAndAudits()` method for mode transition
- `reset-stores.ts`: `resetAssessStores()` now preserves assessments, only clears audits/alternatives

**Bug Fixes:**
- Fixed syllabus text bug in `/assess/page.tsx` (now uses store instead of localStorage)

**Export Enhancements:**
- Export page now shows assessment count in summary stats
- JSON export includes assessments array

### Assess Mode Implementation (Full 5-Step Flow)
Complete implementation of Assess mode for auditing assessments and generating AI-resistant alternatives.

**New Stores:**
- `assessment-store.ts`: Assessments, vulnerability audits, alternatives (Map-based with custom serialization)
- `rubric-store.ts`: Rubrics with criteria and levels (Map-based)
- Extended `ui-store.ts` with `AssessStep`, `AppMode`, assess navigation state

**New Pages:**
- `/assess`: Assessment Inventory (CRUD, extraction from syllabus)
- `/assess/audit`: Vulnerability Audit (5-dimension analysis with visual badges)
- `/assess/alternatives`: Alternative Generator (accept/customize alternatives)
- `/assess/rubrics`: Rubric Builder (AI-era rubrics with 6 categories)
- `/assess/export`: Review & Export (summary stats, JSON download)

**New API Endpoints:**
- `POST /api/extract/assessments`: Extract assessments from syllabus text
- `POST /api/assess/vulnerability-audit`: Analyze AI vulnerability across 5 dimensions
- `POST /api/assess/generate-alternatives`: Generate 2-3 authentic alternatives
- `POST /api/assess/generate-rubric`: Generate rubric with AI-era categories

**New Components:**
- `AssessmentCard`: Display card with type/weight badges, edit/delete actions
- `AssessmentForm`: CRUD form with format details and AI policy
- `VulnerabilityBadge`: Risk level badge and detailed 5-dimension breakdown
- `AlternativeCard`: Alternative display with accept/customize actions
- `RubricEditor`: Collapsible criterion editors with level tables

**New Layout Components:**
- `AssessStepper`: 5-step stepper with accent color scheme
- `AssessStepNavigation`: Step navigation with completion tracking

**Entry Points:**
- "Continue to Assess" button on Unpack export page
- Enabled Assess card on home page

### Split Knowledge Graph Extraction (Two-Step API)
- **Node extraction first**: New `/api/extract/knowledge-graph/nodes` endpoint extracts concepts, skills, threshold concepts, and misconceptions with full 8192 token budget
- **Edge extraction second**: New `/api/extract/knowledge-graph/edges` endpoint receives extracted node IDs to create valid relationships
- **Better quality**: Each step has dedicated prompts (`knowledge-graph-nodes.ts`, `knowledge-graph-edges.ts`) focused on its specific task
- **Validation**: Edge endpoint validates node references and filters invalid edges, checks DAG validity
- **Extraction flow updated**: `app/unpack/page.tsx` now calls nodes endpoint first, then edges endpoint with the extracted nodes

### CRUD Editing for Knowledge Graph Concepts
- **Add concepts manually**: "Add Concept" button opens inline form on modules page
- **Edit existing concepts**: Click edit icon to modify label, type, module, difficulty, description, keywords, AI notes
- **Delete concepts**: Delete button with confirmation dialog, automatically removes associated edges
- **Reassign modules**: Dropdown to change which module a concept belongs to
- **Visual improvements**: Shows confirmed status, keywords as chips, descriptions, difficulty level
- **Empty state**: Helpful message when no concepts extracted with option to add manually

### Feature Parity: Demo vs Real Flow
- **Auto-trigger AI suggestions**: Prerequisites page now automatically fetches AI suggestions when user arrives with syllabus but no prerequisites
- **Secondary teaching approaches**: Context page now has checkboxes for selecting secondary teaching approaches (in addition to primary)
- **Prerequisites on export**: Export page now correctly displays prerequisites from knowledge graph external nodes (not just context store)

### CRUD Editing for Knowledge Graph Relationships
- **Add relationships**: "Add Relationship" button (requires 2+ concepts)
- **Edit relationships**: Click edit icon to modify source, target, relationship type, strength, rationale
- **Delete relationships**: Delete button with confirmation dialog
- **Form validation**: Prevents self-referencing edges (source ≠ target)
- **Visual feedback**: Shows relationship type badge, strength indicator, confirmed checkmark
- **New constant**: Added `EDGE_STRENGTHS` to `types/schema.ts`

### Context Page Redesign (Collapsible Sections)
- **All 5 sections collapsible**: AI Policy, Learner Profile, Teaching Approach, Instructor Persona, Discipline Conventions
- **Removed "Advanced Options"**: Instructor Persona and Discipline Conventions now at same level as other sections
- **Default state**: AI Policy expanded, all others collapsed
- **Completion indicators**: Green checkmark when section has data
- **Summary previews**: Collapsed headers show current values (e.g., "Discussion-Based + 2 more")
- **Instructor Persona redesign**: Inline chip-style selects on one row (`[Formality ▼] [Encouragement ▼] [Feedback ▼]`)

### UI Improvements
- **Home page logo**: Added Course Architect logo to home page header
- **Upload page simplified**: Removed "What happens next?" box, added reassurance text to header
- **Competency page redesign**:
  - Replaced collapsible FAQ with always-visible orientation card (question mark icon + inline text)
  - Course Information now uses compact inline chips (Code, Discipline, Level, Credits)
  - Core Competency statement is directly editable (no Edit button needed)
  - Competency Type uses inline chip style matching Course Info
  - Added Credits field to Course Information
  - Distinct background colors: slate-100 for Course Info, primary-50 for Core Competency

### Bug Fixes
- **DOCX parsing**: Fixed server-side parsing to use `Buffer` instead of `ArrayBuffer` (mammoth requirement in Node.js)

### Knowledge Graph Extraction Enhancements
Enhanced prompt in `lib/prompts/knowledge-graph-extraction.ts`:
- Increased extraction target to 4-7 concepts per module
- Added `is_entry_point` field for foundational concepts
- Required `keywords` (3-5 terms) for every node
- Required `ai_notes` for difficult concepts
- Better misconception extraction (at least 1 per threshold concept)
- Clearer confidence scoring ranges (0.90-1.0, 0.75-0.89, 0.60-0.74)
- Emphasis on cross-module thematic connections

## Environment

Requires `ANTHROPIC_API_KEY` environment variable for AI extraction features.

For Vercel deployment, add this in Settings → Environment Variables.

## Key Files

- `course-architect-prd.md` - Full product requirements document
- `schema-v0.4.json` - JSON schema for course architect documents
- `schema-v0.4-guide.md` - Human-readable schema documentation
- `types/schema.ts` - TypeScript types derived from schema
- `vercel.json` - Vercel deployment configuration
