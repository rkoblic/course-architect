# CLAUDE.md

This file provides context for Claude Code when working on this project.

## Project Overview

Course Architect is a Next.js web app that helps higher education faculty transform syllabi into AI-ready curriculum structures. It has two modes:

1. **Unpack Mode** (functional): Transform syllabi into structured, machine-readable formats
2. **Assess Mode** (not started): Audit assessments for AI vulnerability and generate alternatives

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
  unpack/               # Unpack mode pages
    page.tsx            # Step 1: Upload & extract
    competency/         # Step 2: Core competency
    modules/            # Step 3: Edit modules
    prerequisites/      # Step 4: Map prerequisites (with AI suggestions)
    context/            # Step 5: AI policy & context
    export/             # Step 6: Review & export JSON
  api/
    parse/              # File parsing endpoint
    extract/
      metadata/         # Course metadata extraction
      modules/          # Module extraction
      knowledge-graph/  # Knowledge graph extraction (legacy single-call)
        nodes/          # Node extraction (step 1 of split extraction)
        edges/          # Edge extraction (step 2, uses node IDs)
    suggest/
      prerequisites/    # AI prerequisite suggestions

components/
  ui/                   # Base UI components (Card, Tabs, Button, etc.)
  layout/               # Layout components (StepNavigation, Header, Stepper)
  upload/               # Upload components (FileDropzone, PasteInput, ExtractionProgress)

stores/
  course-store.ts       # Course metadata & core competency
  module-store.ts       # Learning modules (array)
  knowledge-graph-store.ts  # Nodes & edges (Maps, not arrays!)
  context-store.ts      # AI policy, learner profile, prerequisites
  ui-store.ts           # UI state, extraction progress, step tracking

lib/
  anthropic.ts          # Claude API client
  parsers/              # DOCX parser (PDF disabled)
  prompts/              # AI extraction prompts
  utils.ts              # Utility functions (cn for classnames)

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

## Unpack Flow (6 Steps)

1. **Upload** (`/unpack`): Upload DOCX/TXT or paste syllabus text
2. **Competency** (`/unpack/competency`): Define core competency
3. **Modules** (`/unpack/modules`): Review and edit learning modules
4. **Prerequisites** (`/unpack/prerequisites`): Map required skills/knowledge (has AI suggestions)
5. **Context** (`/unpack/context`): Set AI policy and learner profile
6. **Export** (`/unpack/export`): Review and download JSON

## Current State

- Home page with Unpack/Assess mode selection complete (with logo)
- Full Unpack flow implemented (all 6 steps)
- AI extraction pipeline for metadata, modules, and knowledge graph
- AI suggestions for prerequisites (auto-triggered on step 4)
- Export page with JSON download and interactive knowledge graph visualization
- DOCX parsing via server-side API (PDF temporarily disabled)
- Assess mode not started (shows "Coming Soon")

## Recent Changes (January 2026)

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
