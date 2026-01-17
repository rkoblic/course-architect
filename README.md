# Course Architect

A web application that helps higher education faculty transform traditional syllabi into AI-ready curriculum structures.

## Overview

Course Architect operates in two modes:

- **Unpack**: Transform your syllabus into a structured, machine-readable format that preserves pedagogical intent. Extract learning modules, build knowledge graphs, and define AI collaboration modes.

- **Assess**: Audit existing assessments for AI vulnerability and generate authentic alternatives. *(Coming soon)*

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Features

### Unpack Mode

1. **Upload Syllabus**: Upload PDF/DOCX or paste text
2. **AI Extraction**: Automatically extract course metadata, learning modules, and concept relationships
3. **Review & Edit**: Refine AI suggestions with full control
4. **Export**: Generate structured JSON following the Course Architect schema

### What Gets Extracted

- Course metadata (title, level, discipline, delivery mode)
- Core competency statement
- Learning modules with outcomes and Bloom's taxonomy levels
- Knowledge graph of concepts and their relationships
- AI partnership modes for each module

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Anthropic Claude API](https://www.anthropic.com/) - AI extraction

## Project Structure

```
app/           # Next.js App Router pages
components/    # React components
stores/        # Zustand state stores
lib/           # Utilities, API clients, parsers
types/         # TypeScript type definitions
```

## Philosophy

> Faculty are the architects. AI is the tool.

The interface is designed to feel like a collaborative design session, not an automated conversion. Faculty remain in control at every step, with AI offering suggestions they can accept, modify, or reject.

## Documentation

- `course-architect-prd.md` - Product requirements document
- `schema-v0.4-guide.md` - Schema documentation
- `CLAUDE.md` - Context for AI coding assistants

## License

Private - The Design Lab
