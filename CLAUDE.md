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
      knowledge-graph/  # Knowledge graph extraction
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

- Home page with Unpack/Assess mode selection complete
- Full Unpack flow implemented (all 6 steps)
- AI extraction pipeline for metadata, modules, and knowledge graph
- AI suggestions for prerequisites
- Export page with JSON download
- PDF parsing temporarily disabled (use DOCX or paste text)
- Assess mode not started (shows "Coming Soon")

## Environment

Requires `ANTHROPIC_API_KEY` environment variable for AI extraction features.

For Vercel deployment, add this in Settings → Environment Variables.

## Key Files

- `course-architect-prd.md` - Full product requirements document
- `schema-v0.4.json` - JSON schema for course architect documents
- `schema-v0.4-guide.md` - Human-readable schema documentation
- `types/schema.ts` - TypeScript types derived from schema
- `vercel.json` - Vercel deployment configuration
