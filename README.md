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
- Anthropic API key

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

## Unpack Mode Flow

1. **Upload Syllabus**: Upload DOCX/TXT file or paste text directly
2. **Core Competency**: Review and refine the extracted core competency
3. **Learning Modules**: Edit AI-extracted modules with learning outcomes
4. **Prerequisites**: Define required skills and knowledge (with AI suggestions)
5. **Context Layer**: Set AI policy, learner profile, and teaching approach
6. **Export**: Review and download structured JSON

## Features

### AI-Powered Extraction
- Automatic extraction of course metadata, modules, and concepts
- Knowledge graph generation showing concept relationships
- AI suggestions for prerequisite skills and knowledge

### Faculty Control
- Review and edit all AI suggestions
- Accept, modify, or reject any extracted content
- Full control over the final output

### Structured Export
- JSON output following the Course Architect schema (v0.4)
- Machine-readable format for AI integration
- Human-readable instructor view

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Anthropic Claude API](https://www.anthropic.com/) - AI extraction

## Project Structure

```
app/           # Next.js App Router pages and API routes
components/    # React components (ui, layout, upload)
stores/        # Zustand state stores
lib/           # Utilities, API clients, prompts
types/         # TypeScript type definitions
```

## Development

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npx tsc --noEmit # Type check
```

## Deployment

The app is configured for Vercel deployment. Required environment variables:

- `ANTHROPIC_API_KEY` - Your Anthropic API key

## Philosophy

> Faculty are the architects. AI is the tool.

The interface is designed to feel like a collaborative design session, not an automated conversion. Faculty remain in control at every step, with AI offering suggestions they can accept, modify, or reject.

## Documentation

- `course-architect-prd.md` - Product requirements document
- `schema-v0.4-guide.md` - Schema documentation
- `CLAUDE.md` - Context for AI coding assistants

## Known Limitations

- PDF parsing is temporarily disabled due to compatibility issues
- Use DOCX files or paste text directly for best results

## License

Private - The Design Lab
