# Product Requirements Document: Course Architect

**Version:** 1.0  
**Date:** January 16, 2026  
**Author:** Rachel (The Design Lab) + Claude  

---

## 1. Executive Summary

**Course Architect** is a web application that helps higher education faculty transform traditional syllabi into AI-ready curriculum structures, then design authentic assessments appropriate for the age of AI.

The tool operates in two modes:
1. **Unpack Mode**: Transforms syllabi into structured, machine-legible formats that preserve pedagogical intent
2. **Assess Mode**: Audits existing assessments for AI vulnerability and generates authentic alternatives

### Core Philosophy

Faculty are the architects. AI is the tool. The interface should feel like a collaborative design session, not an automated conversion. Faculty remain in control at every step, with AI offering suggestions they can accept, modify, or reject.

---

## 2. Problem Statement

### The Challenge

Faculty face a dual crisis in the AI era:

1. **Their syllabi are opaque to AI systems.** When faculty want to use AI as a co-teacher, tutor, or learning assistant, the AI has no structured understanding of the course's learning logic, prerequisites, pedagogical approach, or intended outcomes. Faculty end up copy-pasting syllabi into chat windows with inconsistent results.

2. **Their assessments are vulnerable to AI completion.** Traditional essays, problem sets, and take-home exams can often be completed by AI tools, undermining the validity of assessment and creating an arms race between detection and evasion.

### The Opportunity

Faculty need tools that help them:
- Make their pedagogical intent explicit and machine-readable
- Surface the hidden learning logic in their course design
- Create assessments that leverage AI as a tool rather than competing with it
- Maintain ownership and control of their curriculum while enabling AI collaboration

---

## 3. Target Users

### Primary: Higher Education Faculty

**Characteristics:**
- Teaching undergraduate or graduate courses
- Varying levels of technical comfort (design for the less technical)
- Time-constrained; need efficient workflows
- Care deeply about pedagogy and student learning
- Range from AI-curious to AI-skeptical

**Jobs to Be Done:**
- "I want to use AI to help tutor my students, but it doesn't understand my course"
- "I need to redesign my assessments because students are using AI to cheat"
- "I want to be intentional about how AI fits into my teaching"

### Secondary: Instructional Designers

**Characteristics:**
- Supporting multiple faculty across departments
- More technically comfortable
- Thinking at curriculum scale, not just individual courses
- May use outputs to build institutional resources

**Jobs to Be Done:**
- "I need to help faculty across my college prepare for AI"
- "I want to create templates and patterns others can follow"

---

## 4. Design Principles

### 4.1 Faculty as Architect

The faculty member is the designer. AI offers suggestions, surfaces patterns, and does heavy lifting—but every decision is theirs. The interface should feel like a skilled assistant, not an automated pipeline.

**Implementation:**
- AI suggestions are clearly labeled as suggestions
- Easy to edit, override, or ignore any AI output
- Faculty can always see and modify the underlying structure
- No "black box" transformations

### 4.2 Progressive Disclosure

Start simple. Reveal complexity only when needed. Faculty shouldn't face a wall of options upfront.

**Implementation:**
- Core workflow is streamlined (5-6 steps max)
- Advanced options tucked behind "More options" or expandable sections
- Sensible defaults that work for most cases
- Ability to dive deeper when desired

### 4.3 Dual Legibility

Every output should be readable by both humans and machines. Faculty need to review and understand; AI systems need structured data.

**Implementation:**
- Side-by-side or toggle views: "Instructor View" and "AI-Ready JSON"
- Human view uses natural language and visual hierarchy
- Machine view uses documented schema
- Both views represent the same underlying data

### 4.4 Pedagogical Integrity

The tool should preserve and make explicit the pedagogical choices faculty have made—not flatten them into generic structures.

**Implementation:**
- Capture teaching philosophy and approach
- Preserve discipline-specific conventions
- Surface implicit assumptions rather than overriding them
- Allow for pedagogical diversity (not one "right" way)

---

## 5. Feature Specification

### 5.1 Mode 1: Unpack (Course Unpacker)

Transform a traditional syllabus into a structured, AI-ready curriculum.

#### Step 1: Upload & Extract

**User Action:** Upload syllabus (PDF, DOCX, or paste text)

**System Response:**
- Parse document structure
- Extract key elements using AI:
  - Course metadata (title, code, credits, level, discipline)
  - Learning objectives (as stated)
  - Topic/week structure
  - Existing assessments (types, weights, descriptions)
  - Policies (grading, attendance, academic integrity)
  - Any stated prerequisites

**UI Elements:**
- Drag-and-drop upload zone
- Progress indicator during extraction
- "We found the following..." summary for review

**Faculty Control:**
- Review all extracted elements
- Correct any misinterpretations
- Add missing information

---

#### Step 2: Define Core Competency

**Purpose:** Identify the central "through-line" of the course—what learners will be able to do by the end.

**User Action:** Review AI-suggested competency statement, edit as needed

**AI Suggestion Logic:**
- Synthesize from stated learning objectives
- Frame as "Learners will be able to..." statement
- Identify competency type

**Competency Types:**
| Type | Definition | Example |
|------|------------|---------|
| **Knowledge** | Understanding concepts, theories, facts | "Explain the causes of the French Revolution" |
| **Skill** | Performing procedures, techniques | "Conduct a statistical analysis using R" |
| **Integrated** | Combining knowledge + skill + judgment | "Diagnose organizational challenges and design evidence-based interventions" |
| **Disposition** | Developing habits of mind, values | "Approach engineering problems with ethical consideration" |

**UI Elements:**
- Large text area for competency statement
- Dropdown for competency type
- "Why this matters" expandable explanation
- "AI suggested" badge on AI-generated content

**Faculty Control:**
- Full editing of competency statement
- Override competency type
- Option to define multiple competencies for complex courses

---

#### Step 3: Structure Modules

**Purpose:** Break the course into coherent learning modules with explicit outcomes and AI partnership modes.

**User Action:** Review AI-suggested module structure, reorganize and edit as needed

**AI Suggestion Logic:**
- Group weeks/topics into 4-8 thematic modules
- Generate learning outcome for each module
- Suggest Bloom's level based on outcome verbs
- Suggest AI Partnership mode based on content type

**Module Structure:**
```
Module:
  - title: string
  - learning_outcome: string (what learners will be able to do)
  - bloom_level: enum (see below)
  - ai_partnership_mode: enum (see below)
  - topics: array of strings
  - estimated_duration: string (e.g., "2 weeks")
  - prerequisites: array of module references (optional)
  - assessments: array of assessment references (optional)
```

**Bloom's Taxonomy Levels:**
| Level | Verbs | Description |
|-------|-------|-------------|
| **Remember** | Define, list, recall, identify | Retrieving information |
| **Understand** | Explain, describe, summarize, interpret | Grasping meaning |
| **Apply** | Use, demonstrate, implement, solve | Using knowledge in new situations |
| **Analyze** | Compare, contrast, examine, differentiate | Breaking down into parts |
| **Evaluate** | Judge, critique, justify, assess | Making judgments |
| **Create** | Design, construct, develop, formulate | Producing new or original work |

**AI Partnership Taxonomy:**

This taxonomy defines how AI should engage with learners for each module. It helps AI co-teachers know their role.

| Mode | AI Role | Student Role | When to Use |
|------|---------|--------------|-------------|
| **Instruct** | Primary explainer, content delivery | Receive, question, practice | Foundational concepts, first exposure |
| **Guide** | Socratic questioner, hints not answers | Discover, reason, struggle productively | Building understanding, developing thinking |
| **Assist** | On-demand helper, answers when asked | Lead their own work, seek help as needed | Application, practice, homework |
| **Collaborate** | Thought partner, co-creator | Work alongside AI as peer | Creative projects, brainstorming, drafting |
| **Audit** | Reviewer, feedback provider | Submit work for critique | Revision, self-assessment, quality check |
| **Witness** | Observer only, no assistance | Demonstrate mastery independently | Summative assessment, high-stakes work |

**UI Elements:**
- Draggable module cards
- Inline editing for all fields
- Dropdowns for Bloom's level and AI Partnership mode
- "Add module" and "Delete module" controls
- Visual indicator of module sequence
- Expandable "Topics included" section per module

**Faculty Control:**
- Reorder modules via drag-and-drop
- Edit all module content
- Add/remove modules
- Override all AI suggestions

---

#### Step 4: Map Prerequisites & Dependencies

**Purpose:** Make explicit which modules depend on which, and what prior knowledge is assumed.

**User Action:** Review and adjust the prerequisite map

**AI Suggestion Logic:**
- Analyze module outcomes for dependency language
- Identify implicit prerequisite relationships
- Flag assumed prior knowledge from outside the course

**Prerequisite Types:**
| Type | Description | Example |
|------|-------------|---------|
| **Internal** | Another module in this course | "Module 3 requires Module 1" |
| **External - Course** | A prerequisite course | "Requires MATH 101" |
| **External - Skill** | An assumed competency | "Assumes basic Excel proficiency" |
| **External - Knowledge** | Assumed background | "Assumes familiarity with US history" |

**UI Elements:**
- Visual dependency graph (modules as nodes, prerequisites as edges)
- Checklist of AI-detected assumptions
- Ability to add/remove dependency links
- "What students should know before this module" section per module

**Faculty Control:**
- Add/remove all prerequisite links
- Confirm or dismiss AI-detected assumptions
- Add notes about prerequisite flexibility

---

#### Step 5: Add Context Layer

**Purpose:** Capture the human elements that shape how AI should engage with this course.

**Sections:**

**5a. AI Use Policy**
How should students use AI in this course?

| Policy Level | Description |
|--------------|-------------|
| **Encouraged** | AI use welcomed for learning, practice, ideation |
| **Permitted with Attribution** | AI use allowed if disclosed and cited |
| **Restricted** | AI prohibited on graded work; allowed for practice |
| **Prohibited** | No AI use permitted |
| **Custom** | Faculty defines specific policy |

Plus: Free-text field for policy details and rationale.

**5b. Learner Profile**
Who are your students?

| Profile | Description |
|---------|-------------|
| **Traditional Undergraduates** | Full-time, 18-22, campus-based |
| **Adult Learners** | Working professionals, balancing commitments |
| **Graduate Students** | Advanced, specialized, research-oriented |
| **Career Changers** | Re-skilling, new to field |
| **Mixed/Other** | Diverse population |

Plus: Free-text for additional context (e.g., "Many are first-generation students," "Most have strong quantitative backgrounds").

**5c. Teaching Approach**
What's your pedagogical philosophy for this course?

| Approach | Description |
|----------|-------------|
| **Lecture-Based** | Instructor presents, students absorb and practice |
| **Discussion-Based** | Collaborative sense-making, Socratic dialogue |
| **Problem-Based** | Learning through authentic problem-solving |
| **Project-Based** | Extended projects as primary learning vehicle |
| **Studio/Workshop** | Iterative creation with frequent critique |
| **Flipped** | Content outside class, application in class |
| **Hybrid/Custom** | Combination of approaches |

Plus: Free-text for philosophy statement (e.g., "I believe students learn best when they struggle productively with challenging problems before receiving instruction").

**5d. Instructor Persona for AI**
How should AI represent you when co-teaching?

- Formality level: Casual / Conversational / Professional / Formal
- Encouragement style: Warm & supportive / Matter-of-fact / Challenging
- Feedback approach: Strengths-first / Direct critique / Balanced
- Any phrases or approaches to use or avoid

**5e. Discipline Conventions**
What discipline-specific norms should AI respect?

- Citation style (APA, MLA, Chicago, etc.)
- Terminology preferences
- Methodological conventions
- Ethical considerations specific to field

**UI Elements:**
- Radio buttons for predefined options
- Text areas for custom input
- "Why we ask this" expandable explanations
- Progress indicator showing completion

**Faculty Control:**
- All fields optional except AI Use Policy
- Full customization via text fields
- Can return and edit at any time

---

#### Step 6: Review & Export

**Purpose:** Review the complete transformation and export in desired format.

**Views:**

**Instructor View:**
- Clean, human-readable summary
- Organized by section (Overview, Competency, Modules, Context)
- Printable / shareable with colleagues

**AI-Ready JSON:**
- Complete structured data
- Documented schema
- Copy-to-clipboard functionality
- Download as .json file

**Additional Exports:**
- Markdown summary
- System prompt snippet (ready to paste into AI tools)
- Enhanced syllabus (original + structured addendum)

**UI Elements:**
- Toggle between Instructor View and JSON View
- Export buttons for each format
- "Copy to clipboard" with confirmation
- "Save to account" (if logged in)
- "Start over" option

---

### 5.2 Mode 2: Assess (Assessment Designer)

Transform existing assessments for the AI era and design new authentic assessments.

#### Entry Point

**Options:**
1. Start from unpacked course (Mode 1 output)
2. Upload course materials directly (triggers abbreviated unpack)
3. Start fresh with just learning objectives

---

#### Step 1: Assessment Inventory

**Purpose:** Catalog existing assessments and understand their current state.

**User Action:** Review AI-extracted assessments or manually enter them

**Assessment Catalog Structure:**
```
Assessment:
  - name: string
  - type: enum (see below)
  - weight: percentage
  - description: string
  - learning_objectives_assessed: array
  - current_format: string (e.g., "take-home essay," "in-class exam")
  - time_constraint: string (e.g., "72 hours," "50 minutes")
  - collaboration_allowed: boolean
  - resources_allowed: string
```

**Assessment Types:**
| Type | Examples |
|------|----------|
| **Written** | Essays, papers, reports, reflections |
| **Exam** | Midterm, final, quiz |
| **Problem Set** | Homework, exercises, calculations |
| **Project** | Research project, design project, capstone |
| **Presentation** | Oral presentation, poster, pitch |
| **Performance** | Lab practical, demonstration, simulation |
| **Portfolio** | Collected work over time |
| **Participation** | Discussion, attendance, engagement |

**UI Elements:**
- List of detected assessments (if from Mode 1)
- "Add assessment" button
- Editable cards for each assessment
- Weight must sum to 100% indicator

---

#### Step 2: AI Vulnerability Audit

**Purpose:** Analyze each assessment for susceptibility to AI completion.

**AI Analysis Dimensions:**

| Dimension | Question | Risk Indicator |
|-----------|----------|----------------|
| **Reproducibility** | Could AI generate a plausible response? | High if generic prompt could produce similar output |
| **Verification** | Can you verify the student did the work? | High if no process visibility |
| **Uniqueness** | Does it require student-specific input? | High if interchangeable between students |
| **Temporal** | Is it time-constrained in ways AI can't circumvent? | Low if proctored/synchronous |
| **Embodied** | Does it require physical presence or action? | Low if requires in-person performance |

**Vulnerability Rating:**
- 🟢 **Low Risk**: Difficult for AI to complete; authentic by design
- 🟡 **Medium Risk**: AI could assist significantly; consider modifications
- 🔴 **High Risk**: AI could likely complete independently; redesign recommended

**UI Elements:**
- Vulnerability badge on each assessment
- Expandable analysis explanation
- "Why this rating" with specific factors
- Filter/sort by vulnerability level

**Faculty Control:**
- Override vulnerability ratings
- Mark assessments as "keep as-is" regardless of rating
- Add notes about mitigating factors

---

#### Step 3: Authentic Assessment Generator

**Purpose:** Generate alternatives that are inherently AI-resistant and pedagogically sound.

**Authenticity Principles:**

An assessment is **authentic** in the AI era when it:

1. **Requires what AI lacks:**
   - Lived experience and personal perspective
   - Real-time physical presence
   - Relationship-dependent interaction
   - Embodied knowledge and performance

2. **Makes process visible:**
   - Iterative drafts with genuine evolution
   - Oral defense or explanation
   - Metacognitive reflection on process
   - Documentation of decision-making

3. **Leverages AI as tool:**
   - AI use is part of the task (with evaluation of AI use)
   - Critique or improve AI output
   - Demonstrate judgment AI cannot

4. **Anchors to specifics:**
   - Local context (this campus, this community)
   - Current events (this week's news)
   - Peer interaction (respond to specific classmates)
   - Personal connection (your experience, your values)

**Generation Approach:**

For each high/medium risk assessment, AI suggests 2-3 alternatives that:
- Assess the same learning objectives
- Incorporate authenticity principles
- Fit the course context and teaching approach
- Are practical to implement

**Alternative Patterns:**

| Original Type | Authentic Alternatives |
|---------------|------------------------|
| **Take-home essay** | Oral exam with follow-up questions; Essay + process portfolio + defense; Collaborative writing with individual reflection |
| **Problem set** | Live problem-solving session; Problem set + video explanation of approach; Create and solve your own problems |
| **Research paper** | Research proposal + pitch; Annotated bibliography + synthesis conversation; Paper + peer review + revision |
| **Multiple choice exam** | Exam + written justifications; Two-stage exam (individual then group); Oral exam sampling from question bank |
| **Group project** | Individual contribution logs + peer assessment; Project + individual oral defense; Staged deliverables with check-ins |

**UI Elements:**
- Side-by-side: Original assessment | Suggested alternatives
- "Generate more alternatives" button
- Expandable rationale for each suggestion
- "Use this" button to adopt alternative
- "Customize" to edit suggestion

**Faculty Control:**
- Accept, modify, or reject all suggestions
- Generate additional alternatives
- Create custom assessment from scratch
- Blend elements from multiple suggestions

---

#### Step 4: Rubric Builder

**Purpose:** Create rubrics that evaluate what matters in authentic assessment.

**Rubric Dimensions for AI-Era Assessment:**

Beyond traditional content mastery, consider:

| Dimension | What It Captures |
|-----------|------------------|
| **Process Quality** | Evidence of genuine intellectual work over time |
| **Metacognitive Awareness** | Ability to reflect on and explain one's thinking |
| **AI Collaboration Skill** | Effective, ethical, critical use of AI tools |
| **Adaptability** | Response to feedback, unexpected challenges |
| **Authentic Voice** | Personal perspective, original insight |
| **Contextual Application** | Connection to specific, local, current circumstances |

**Rubric Generation:**

AI generates a rubric for each assessment including:
- Criteria aligned to learning objectives
- Performance levels (e.g., Exemplary / Proficient / Developing / Beginning)
- Descriptors that distinguish levels
- Suggested point allocations

**UI Elements:**
- Rubric table editor (add/remove criteria and levels)
- AI-suggested criteria with rationale
- Preview in clean format
- Export to common formats (Word, PDF, Google Docs)

---

#### Step 5: Generate Student Guidelines

**Purpose:** Create clear guidance for students on AI use in assessments.

**Guideline Components:**

For each assessment:
- What AI use is allowed/prohibited
- How to cite AI if used
- What "your own work" means for this task
- How process will be evaluated
- Examples of appropriate vs. inappropriate AI use

**Course-Level AI Collaboration Guide:**

- Overall course philosophy on AI
- Assessment-by-assessment breakdown
- Skills students should develop vs. delegate to AI
- Resources for effective AI use
- Academic integrity expectations

**UI Elements:**
- Generated guidelines per assessment
- Editable text
- Export as student-facing document
- Option to generate as syllabus addendum

---

#### Step 6: Review & Export

**Outputs:**

1. **Assessment Redesign Summary**
   - Before/after comparison
   - Rationale for changes
   - Implementation notes

2. **Complete Rubrics Package**
   - All rubrics in consistent format
   - Ready for LMS upload

3. **Student Guidelines Document**
   - AI use policy
   - Assessment-specific guidance
   - Academic integrity statement

4. **Instructor Implementation Guide**
   - How to administer new assessments
   - What to watch for
   - Grading guidance

---

## 6. Data Schema

### 6.1 AI-Readable Course Schema (v0.3)

```json
{
  "$schema": "https://thedesignlab.io/schemas/course-architect/v0.3",
  "version": "0.3",
  "exported_at": "ISO-8601 timestamp",
  "tool": "Course Architect",
  
  "course": {
    "title": "string",
    "code": "string (optional)",
    "institution": "string (optional)",
    "discipline": "string",
    "level": "introductory | intermediate | advanced | graduate",
    "credits": "number (optional)",
    "duration": "string (e.g., '15 weeks')"
  },
  
  "core_competency": {
    "statement": "string (Learners will be able to...)",
    "type": "knowledge | skill | integrated | disposition"
  },
  
  "modules": [
    {
      "id": "module-1",
      "sequence": 1,
      "title": "string",
      "learning_outcome": "string",
      "bloom_level": "remember | understand | apply | analyze | evaluate | create",
      "ai_partnership_mode": "instruct | guide | assist | collaborate | audit | witness",
      "topics": ["string"],
      "estimated_duration": "string",
      "prerequisites": {
        "internal": ["module-id"],
        "external": [
          {
            "type": "course | skill | knowledge",
            "description": "string"
          }
        ]
      }
    }
  ],
  
  "assessments": [
    {
      "id": "assessment-1",
      "name": "string",
      "type": "written | exam | problem_set | project | presentation | performance | portfolio | participation",
      "weight": "number (percentage)",
      "description": "string",
      "modules_assessed": ["module-id"],
      "ai_policy": "encouraged | permitted_with_attribution | restricted | prohibited | custom",
      "ai_policy_details": "string (optional)",
      "authenticity_features": ["string"],
      "rubric_id": "rubric-1 (optional)"
    }
  ],
  
  "rubrics": [
    {
      "id": "rubric-1",
      "assessment_id": "assessment-1",
      "criteria": [
        {
          "name": "string",
          "weight": "number (percentage)",
          "levels": [
            {
              "name": "Exemplary",
              "points": 4,
              "description": "string"
            }
          ]
        }
      ]
    }
  ],
  
  "context": {
    "ai_policy": {
      "level": "encouraged | permitted_with_attribution | restricted | prohibited | custom",
      "details": "string"
    },
    "learner_profile": {
      "type": "traditional_undergraduate | adult_learner | graduate | career_changer | mixed",
      "details": "string"
    },
    "teaching_approach": {
      "type": "lecture | discussion | problem_based | project_based | studio | flipped | hybrid",
      "philosophy": "string"
    },
    "instructor_persona": {
      "formality": "casual | conversational | professional | formal",
      "encouragement_style": "warm | matter_of_fact | challenging",
      "feedback_approach": "strengths_first | direct | balanced",
      "notes": "string"
    },
    "discipline_conventions": {
      "citation_style": "string",
      "terminology_notes": "string",
      "methodological_notes": "string",
      "ethical_considerations": "string"
    }
  },
  
  "ai_system_prompt_snippet": "string (auto-generated, ready to paste)"
}
```

---

## 7. Technical Architecture

### 7.1 Technology Stack (Recommended for Claude Code)

**Frontend:**
- React with TypeScript
- Tailwind CSS for styling
- Zustand or React Context for state management
- React DnD for drag-and-drop module reordering

**Backend:**
- Node.js with Express (or serverless functions)
- Claude API for AI extraction and generation
- PDF.js for PDF parsing
- Mammoth.js for DOCX parsing

**Storage:**
- Local storage for session persistence
- Optional: Database for user accounts and saved courses (PostgreSQL or MongoDB)

**Deployment:**
- Vercel, Netlify, or Railway for easy deployment
- No complex infrastructure needed for MVP

### 7.2 AI Integration Points

| Feature | AI Task | Model Recommendation |
|---------|---------|---------------------|
| Syllabus extraction | Parse unstructured text into structured data | Claude Sonnet |
| Competency generation | Synthesize objectives into competency statement | Claude Sonnet |
| Module structuring | Group topics, suggest outcomes | Claude Sonnet |
| Prerequisite detection | Identify dependencies from outcome language | Claude Sonnet |
| Assessment audit | Analyze vulnerability dimensions | Claude Sonnet |
| Alternative generation | Create authentic assessment options | Claude Sonnet |
| Rubric generation | Build criteria and descriptors | Claude Sonnet |
| System prompt generation | Compile context into usable prompt | Claude Haiku (simpler task) |

### 7.3 Key Technical Considerations

**File Parsing:**
- PDF extraction can be lossy; provide "paste text" fallback
- Handle diverse syllabus formats gracefully
- Preview extracted content before proceeding

**State Management:**
- Persist work-in-progress to local storage
- Enable save/resume for multi-session work
- Undo/redo for editing steps

**AI Interaction:**
- Show loading states during AI processing
- Handle API errors gracefully
- Allow retry on failed extractions

**Export:**
- JSON export should be valid and complete
- Markdown export should be well-formatted
- Consider PDF export for formal documents

---

## 8. User Interface Guidelines

### 8.1 Visual Design Principles

**Clean and Professional:**
- White/light backgrounds with generous whitespace
- Clear visual hierarchy
- Professional but not sterile

**Progress and Orientation:**
- Clear step indicator showing where user is in workflow
- Ability to navigate between steps
- Progress auto-saves

**AI Transparency:**
- Visual distinction between AI-generated and user-entered content
- "AI suggested" badges on recommendations
- Easy to see what's AI vs. human

**Control and Editability:**
- All content is editable
- Clear edit affordances (pencil icons, hover states)
- Confirmation before destructive actions

### 8.2 Key UI Components

**Step Indicator:**
- Horizontal progress bar showing 6 steps
- Completed steps show checkmark
- Current step highlighted
- Clickable to navigate (if step is available)

**Module Cards:**
- Draggable for reordering
- Expandable for details
- Inline editing for quick changes
- Visual indicators for Bloom's level and AI mode

**AI Suggestion Blocks:**
- Light blue or purple tint to distinguish
- "AI suggested" label
- "Edit" and "Regenerate" buttons
- Easy to accept or modify

**Export Panel:**
- Toggle between views (Instructor / JSON)
- Multiple export format buttons
- Copy-to-clipboard with toast confirmation

### 8.3 Responsive Design

- Primary target: Desktop (faculty often work on laptops/desktops)
- Tablet support for review and light editing
- Mobile: View-only mode for reviewing exports

---

## 9. Success Metrics

### 9.1 Usage Metrics

- Courses unpacked (completion rate through all steps)
- Assessments redesigned
- Exports generated (by format)
- Return usage (faculty coming back for additional courses)

### 9.2 Quality Metrics

- User edits to AI suggestions (less editing = better suggestions)
- Time to completion
- Export format preferences

### 9.3 Outcome Metrics (Longer-term)

- Faculty satisfaction surveys
- Reported use of exports with AI tools
- Assessment integrity improvements (if trackable)

---

## 10. MVP Scope

### 10.1 MVP Features (Phase 1)

**Unpack Mode:**
- ✅ Upload syllabus (PDF, DOCX, paste)
- ✅ AI extraction of course metadata
- ✅ Core competency definition
- ✅ Module structuring with Bloom's and AI Partnership
- ✅ Basic context layer (AI policy, learner profile, teaching approach)
- ✅ Dual export (Instructor view + JSON)

**Assess Mode:**
- ✅ Assessment inventory (manual entry or from unpack)
- ✅ AI vulnerability audit with ratings
- ✅ Basic alternative suggestions for high-risk assessments
- ✅ Simple rubric generation
- ✅ Export assessment package

### 10.2 Post-MVP Features (Phase 2+)

- Prerequisite mapping visualization
- Standards alignment (link to CCSS, competency frameworks)
- Expanded context layer (instructor persona, discipline conventions)
- Student guidelines generator
- Account system with saved courses
- Team/institution sharing
- LMS integration (Canvas, Blackboard export formats)
- Version history for courses

---

## 11. Open Questions

1. **Authentication:** Do we need user accounts for MVP, or is local-storage-only acceptable?
   - *Recommendation:* Start without accounts; add later if needed

2. **Pricing:** Is this a free tool, freemium, or paid?
   - *To discuss:* Depends on business model for The Design Lab

3. **AI Costs:** How do we handle API costs for AI features?
   - *Consideration:* Rate limiting, optional user API key, or built into pricing

4. **Customization:** How much should the schema be customizable?
   - *Recommendation:* Fixed schema for MVP; customization later

5. **Standards Integration:** Should we integrate with Learning Commons or other knowledge graphs?
   - *Recommendation:* Post-MVP feature; design schema to accommodate

---

## 12. Appendices

### Appendix A: Example Outputs

*[To be populated with example JSON and Instructor View outputs from a sample course]*

### Appendix B: Competitor Analysis

| Tool | Strength | Gap |
|------|----------|-----|
| Generic ChatGPT | Flexible, accessible | No structure, no persistence, no schema |
| LMS built-in tools | Integrated with grading | Not AI-aware, no pedagogical framing |
| Curriculum mapping tools | Structure-focused | Not AI-era focused, heavy implementation |

### Appendix C: AI Partnership Mode Detailed Definitions

**Instruct Mode:**
- AI takes lead in explanation
- Provides direct answers and examples
- Appropriate for: First exposure to concepts, foundational knowledge
- Student role: Receive, question, practice
- Example prompt framing: "Explain [concept] clearly. Provide examples. Answer questions directly."

**Guide Mode:**
- AI asks questions more than answers
- Uses Socratic method
- Appropriate for: Building understanding, developing reasoning
- Student role: Discover, reason, struggle productively
- Example prompt framing: "Help the student discover [concept] through questions. Don't give direct answers; guide their thinking."

**Assist Mode:**
- AI available on-demand
- Provides help when asked, doesn't intervene otherwise
- Appropriate for: Practice, application, homework
- Student role: Lead their own work, seek help when stuck
- Example prompt framing: "Be available to help if asked. Don't volunteer information unless requested."

**Collaborate Mode:**
- AI as thought partner
- Co-creates with student
- Appropriate for: Brainstorming, drafting, creative work
- Student role: Work alongside AI as a peer
- Example prompt framing: "Work together with the student on [task]. Contribute ideas, build on theirs, create together."

**Audit Mode:**
- AI as reviewer only
- Provides feedback, doesn't contribute to work
- Appropriate for: Revision, self-assessment, quality check
- Student role: Submit work for critique
- Example prompt framing: "Review the student's work. Provide constructive feedback. Do not write or rewrite for them."

**Witness Mode:**
- AI observes but does not assist
- May record or document only
- Appropriate for: Summative assessment, demonstrations of mastery
- Student role: Perform independently
- Example prompt framing: "Observe only. Do not provide any assistance, hints, or feedback during this task."

---

*End of PRD*
