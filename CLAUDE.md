# CLAUDE.md

This file provides context for Claude Code when working on this project.

## Project Overview

Course Architect is a Next.js web app that helps higher education faculty transform syllabi into AI-ready curriculum structures. It has two modes:

1. **Unpack Mode** (in progress): Transform syllabi into structured, machine-readable formats
2. **Assess Mode** (not started): Audit assessments for AI vulnerability and generate alternatives

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: Zustand stores
- **AI**: Anthropic Claude API for extraction
- **File Parsing**: pdfjs-dist (PDF), mammoth (DOCX)

## Project Structure

```
app/
  page.tsx              # Home page with mode selection
  layout.tsx            # Root layout
  globals.css           # Tailwind + CSS variables
  unpack/               # Unpack mode pages
    page.tsx            # Step 1: Upload & extract
    modules/            # Step 2: Edit modules
    competency/         # Step 3: Core competency
    context/            # Step 4: AI policy & context
    prerequisites/      # Step 5: Prerequisites
  api/
    parse/              # File parsing endpoint
    extract/
      metadata/         # Course metadata extraction
      modules/          # Module extraction
      knowledge-graph/  # Knowledge graph extraction

components/
  ui/                   # Base UI components (Card, Tabs, Button, etc.)
  layout/               # Layout components (StepNavigation)
  upload/               # Upload components (FileDropzone, PasteInput)

stores/
  course-store.ts       # Course metadata & core competency
  module-store.ts       # Learning modules
  knowledge-graph-store.ts  # Nodes & edges
  context-store.ts      # AI policy, learner profile, etc.
  ui-store.ts           # UI state, extraction progress

lib/
  anthropic.ts          # Claude API client
  parsers/              # PDF and DOCX parsers
  prompts/              # AI extraction prompts
  utils.ts              # Utility functions (cn for classnames)

types/
  schema.ts             # TypeScript types matching schema-v0.4.json
```

## Key Files

- `course-architect-prd.md` - Full product requirements document
- `schema-v0.4.json` - JSON schema for course architect documents
- `schema-v0.4-guide.md` - Human-readable schema documentation
- `types/schema.ts` - TypeScript types derived from schema

## Development Commands

```bash
npm run dev    # Start dev server (usually port 3000 or 3001)
npm run build  # Production build
npm run lint   # ESLint
```

## Design Principles

1. **Faculty as Architect**: Faculty control every decision; AI offers suggestions
2. **Progressive Disclosure**: Start simple, reveal complexity when needed
3. **Dual Legibility**: Output readable by both humans and machines

## Current State

- Home page with Unpack/Assess mode selection complete
- Unpack flow: Upload, extraction pipeline, and step navigation built
- Stores and types fully implemented
- Assess mode not started (shows "Coming Soon")

## Environment

Requires `ANTHROPIC_API_KEY` environment variable for AI extraction features.
