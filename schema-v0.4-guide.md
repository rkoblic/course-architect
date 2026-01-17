# Course Architect Schema v0.4 — Documentation

## Overview

This schema extends the original Course Architect design with an integrated **knowledge graph layer** that enables:

- Fine-grained concept mapping alongside coarse module structure
- Explicit prerequisite relationships (DAG-structured)
- Alignment with external competency frameworks (CTDL-ASN, CASE, etc.)
- AI tutoring systems that understand *why* concepts matter
- Gap analysis (taught but not assessed, or vice versa)
- Adaptive learning path support

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Multi-granularity** | Modules (coarse) + Concepts (fine) with explicit linkage |
| **DAG Prerequisites** | Prerequisite edges form directed acyclic graph per Knowledge Space Theory |
| **Modular Patterns** | Following EduCOR: graph components can be used independently |
| **Interoperability** | LRMI/schema.org alignment, CTDL-ASN links, JSON-LD ready |
| **Faculty Authority** | AI extracts, faculty validates; confidence scores track provenance |

---

## Schema Structure

```
Course Architect Document
├── course                 # Metadata (title, code, level, discipline)
├── core_competency        # Central "through-line" of the course
├── modules[]              # Coarse-grained learning units (4-8 per course)
├── knowledge_graph        # Fine-grained concept network
│   ├── metadata           # Extraction method, validation status
│   ├── nodes[]            # Concepts, skills, threshold concepts, misconceptions
│   └── edges[]            # Relationships between nodes
├── assessments[]          # Graded work with AI vulnerability audit
├── rubrics[]              # Evaluation criteria with AI-era dimensions
├── prerequisites          # External requirements (prior courses, skills)
├── context                # Human elements (AI policy, learner profile, persona)
├── learning_paths[]       # Suggested sequences through the graph
└── ai_system_prompt       # Auto-generated prompts for AI tutors
```

---

## Knowledge Graph Deep Dive

### Node Types

| Type | Description | Example |
|------|-------------|---------|
| `concept` | A discrete piece of knowledge | "Supply and Demand", "Pythagorean Theorem" |
| `skill` | A procedural capability | "Conduct regression analysis", "Write a thesis statement" |
| `competency` | Integrated knowledge + skill + judgment | "Design ethical research studies" |
| `threshold_concept` | Transformative, troublesome, integrative concept (Meyer & Land) | "Opportunity cost", "Object-oriented thinking" |
| `misconception` | Common misunderstanding to address | "Correlation implies causation" |

### Edge Types (Relationship Taxonomy)

| Relationship | Direction | Meaning | Constraint |
|--------------|-----------|---------|------------|
| `prerequisite_of` | A → B | Must master A before B | **Must form DAG** |
| `builds_on` | A → B | B extends/deepens A | Softer than prerequisite |
| `part_of` | A → B | A is component of larger B | Compositional |
| `related_to` | A ↔ B | Semantic association | Undirected |
| `contrasts_with` | A ↔ B | Often confused, usefully compared | Undirected |
| `applies_to` | A → B | A is used in context of B | Application |
| `example_of` | A → B | A instantiates B | Concrete → Abstract |
| `requires_skill` | A → B | Concept A needs skill B | Cross-type |
| `develops_skill` | A → B | Concept A builds skill B | Cross-type |
| `addresses_misconception` | A → B | Concept A corrects misconception B | Pedagogical |

### Edge Properties

```json
{
  "source": "concept-supply-demand",
  "target": "concept-market-equilibrium",
  "relationship": "prerequisite_of",
  "strength": "required",        // required | recommended | optional
  "confidence": 0.85,            // AI confidence, 1.0 = faculty confirmed
  "rationale": "Cannot understand equilibrium without supply/demand curves",
  "source": "ai_extracted"       // ai_extracted | faculty_defined | imported
}
```

---

## Example: Economics 101 (Partial)

```json
{
  "schema_version": "0.4",
  "exported_at": "2026-01-16T14:30:00Z",
  "tool": "Course Architect",

  "course": {
    "id": "econ-101-spring-2026",
    "title": "Principles of Microeconomics",
    "code": "ECON 101",
    "institution": "State University",
    "discipline": "Economics",
    "subdiscipline": "Microeconomics",
    "level": "introductory",
    "credits": 3,
    "duration": "15 weeks",
    "delivery_mode": "hybrid"
  },

  "core_competency": {
    "id": "cc-1",
    "statement": "Learners will be able to analyze real-world markets using economic models to predict outcomes and evaluate policy interventions.",
    "type": "integrated",
    "external_alignment": [
      {
        "framework": "CTDL-ASN",
        "uri": "https://credentialengineregistry.org/competencies/abc123",
        "label": "Economic Analysis and Reasoning"
      }
    ]
  },

  "modules": [
    {
      "id": "module-1",
      "sequence": 1,
      "title": "Thinking Like an Economist",
      "description": "Introduction to economic reasoning, scarcity, and trade-offs",
      "learning_outcome": "Apply the concept of opportunity cost to everyday decisions",
      "bloom_level": "apply",
      "ai_partnership_mode": "instruct",
      "topics": ["Scarcity", "Opportunity Cost", "Trade-offs", "Economic Models"],
      "estimated_duration": "2 weeks",
      "concept_ids": ["concept-scarcity", "concept-opportunity-cost", "concept-tradeoffs", "concept-models"],
      "assessment_ids": ["assessment-1"]
    },
    {
      "id": "module-2",
      "sequence": 2,
      "title": "Supply and Demand",
      "description": "The fundamental model of market interaction",
      "learning_outcome": "Predict how changes in market conditions affect prices and quantities",
      "bloom_level": "analyze",
      "ai_partnership_mode": "guide",
      "topics": ["Demand Curves", "Supply Curves", "Equilibrium", "Shifts vs. Movements"],
      "estimated_duration": "3 weeks",
      "concept_ids": ["concept-demand", "concept-supply", "concept-equilibrium", "concept-shifts"],
      "assessment_ids": ["assessment-2"]
    }
  ],

  "knowledge_graph": {
    "metadata": {
      "extraction_method": "ai_with_faculty_review",
      "last_validated": "2026-01-15T10:00:00Z",
      "node_count": 24,
      "edge_count": 31,
      "is_dag_valid": true
    },

    "nodes": [
      {
        "id": "concept-scarcity",
        "type": "threshold_concept",
        "label": "Scarcity",
        "description": "The fundamental economic problem: unlimited wants, limited resources",
        "bloom_level": "understand",
        "difficulty": "foundational",
        "parent_module_id": "module-1",
        "keywords": ["resources", "wants", "needs", "fundamental problem"],
        "ai_notes": "This is a threshold concept—once students truly grasp scarcity, their worldview shifts. Watch for students who still think 'we just need more resources' rather than understanding inherent limits.",
        "common_misconceptions": [
          "Scarcity only applies to poor countries",
          "Technology can eliminate scarcity"
        ],
        "source": "faculty_defined"
      },
      {
        "id": "concept-opportunity-cost",
        "type": "threshold_concept",
        "label": "Opportunity Cost",
        "description": "The value of the next-best alternative foregone when making a choice",
        "bloom_level": "apply",
        "difficulty": "foundational",
        "parent_module_id": "module-1",
        "keywords": ["trade-offs", "choices", "alternatives", "cost"],
        "ai_notes": "Students often confuse opportunity cost with monetary cost. Use personal examples (choosing between studying and socializing) before economic examples.",
        "common_misconceptions": [
          "Opportunity cost is the same as price",
          "Opportunity cost includes all alternatives, not just the next-best"
        ],
        "source": "faculty_defined"
      },
      {
        "id": "concept-demand",
        "type": "concept",
        "label": "Demand",
        "description": "The relationship between price and quantity demanded, holding other factors constant",
        "bloom_level": "understand",
        "difficulty": "foundational",
        "parent_module_id": "module-2",
        "keywords": ["demand curve", "quantity demanded", "law of demand"],
        "source": "ai_extracted"
      },
      {
        "id": "concept-supply",
        "type": "concept",
        "label": "Supply",
        "description": "The relationship between price and quantity supplied, holding other factors constant",
        "bloom_level": "understand",
        "difficulty": "foundational",
        "parent_module_id": "module-2",
        "keywords": ["supply curve", "quantity supplied", "law of supply"],
        "source": "ai_extracted"
      },
      {
        "id": "concept-equilibrium",
        "type": "concept",
        "label": "Market Equilibrium",
        "description": "The point where supply and demand intersect; quantity supplied equals quantity demanded",
        "bloom_level": "analyze",
        "difficulty": "intermediate",
        "parent_module_id": "module-2",
        "keywords": ["equilibrium price", "equilibrium quantity", "market clearing"],
        "ai_notes": "Emphasize that equilibrium is a tendency, not a fixed state. Real markets are always adjusting toward equilibrium.",
        "source": "ai_with_faculty_review"
      },
      {
        "id": "skill-graph-reading",
        "type": "skill",
        "label": "Reading Economic Graphs",
        "description": "Ability to interpret supply/demand curves, identify equilibrium, and predict shifts",
        "bloom_level": "apply",
        "difficulty": "foundational",
        "parent_module_id": "module-2",
        "source": "faculty_defined"
      },
      {
        "id": "misconception-correlation-causation",
        "type": "misconception",
        "label": "Correlation Implies Causation",
        "description": "The mistaken belief that because two variables move together, one causes the other",
        "parent_module_id": "module-1",
        "source": "faculty_defined"
      }
    ],

    "edges": [
      {
        "id": "edge-1",
        "source": "concept-scarcity",
        "target": "concept-opportunity-cost",
        "relationship": "prerequisite_of",
        "strength": "required",
        "confidence": 1.0,
        "rationale": "Opportunity cost only exists because of scarcity; without scarcity, there are no trade-offs",
        "source": "faculty_defined"
      },
      {
        "id": "edge-2",
        "source": "concept-opportunity-cost",
        "target": "concept-demand",
        "relationship": "prerequisite_of",
        "strength": "recommended",
        "confidence": 0.9,
        "rationale": "Understanding why demand curves slope downward requires opportunity cost thinking",
        "source": "ai_extracted"
      },
      {
        "id": "edge-3",
        "source": "concept-demand",
        "target": "concept-equilibrium",
        "relationship": "prerequisite_of",
        "strength": "required",
        "confidence": 1.0,
        "rationale": "Cannot understand equilibrium without demand curve",
        "source": "ai_with_faculty_review"
      },
      {
        "id": "edge-4",
        "source": "concept-supply",
        "target": "concept-equilibrium",
        "relationship": "prerequisite_of",
        "strength": "required",
        "confidence": 1.0,
        "rationale": "Cannot understand equilibrium without supply curve",
        "source": "ai_with_faculty_review"
      },
      {
        "id": "edge-5",
        "source": "concept-demand",
        "target": "concept-supply",
        "relationship": "related_to",
        "strength": "required",
        "confidence": 1.0,
        "rationale": "These concepts are taught together and mirror each other",
        "source": "faculty_defined"
      },
      {
        "id": "edge-6",
        "source": "concept-equilibrium",
        "target": "skill-graph-reading",
        "relationship": "requires_skill",
        "strength": "required",
        "confidence": 0.95,
        "rationale": "Finding equilibrium requires reading supply/demand graphs",
        "source": "ai_extracted"
      },
      {
        "id": "edge-7",
        "source": "concept-scarcity",
        "target": "misconception-correlation-causation",
        "relationship": "addresses_misconception",
        "strength": "recommended",
        "confidence": 0.8,
        "rationale": "Economic reasoning about scarcity helps students think causally",
        "source": "ai_extracted"
      }
    ]
  },

  "assessments": [
    {
      "id": "assessment-1",
      "name": "Opportunity Cost Reflection",
      "type": "written",
      "weight": 10,
      "description": "Personal essay analyzing a significant decision using opportunity cost framework",
      "module_ids": ["module-1"],
      "concept_ids": ["concept-scarcity", "concept-opportunity-cost"],
      "format": {
        "setting": "take_home",
        "time_constraint": "1 week",
        "collaboration": "individual",
        "resources_allowed": "Any, but no AI writing"
      },
      "ai_policy": "restricted",
      "ai_policy_details": "AI may be used for brainstorming and feedback on drafts, but final writing must be your own. Submit AI conversation logs with your essay.",
      "vulnerability_audit": {
        "risk_level": "low",
        "dimensions": {
          "reproducibility": "low",
          "verification": "medium",
          "uniqueness": "low",
          "temporal": "high",
          "embodied": "high"
        },
        "rationale": "Requires personal experience and specific decision analysis that AI cannot fabricate authentically. Process documentation (AI logs) adds verification.",
        "audited_at": "2026-01-15T10:00:00Z"
      },
      "authenticity_features": [
        "Requires personal lived experience",
        "Specific decision with verifiable context",
        "Process documentation required",
        "Oral follow-up questions possible"
      ],
      "rubric_id": "rubric-1"
    }
  ],

  "rubrics": [
    {
      "id": "rubric-1",
      "assessment_id": "assessment-1",
      "criteria": [
        {
          "name": "Economic Reasoning",
          "description": "Correct application of opportunity cost concept",
          "weight": 40,
          "category": "content_mastery",
          "concept_ids": ["concept-opportunity-cost", "concept-scarcity"],
          "levels": [
            {
              "name": "Exemplary",
              "points": 4,
              "description": "Correctly identifies true opportunity cost (next-best alternative), considers multiple foregone options, explains why the chosen alternative's value matters"
            },
            {
              "name": "Proficient",
              "points": 3,
              "description": "Correctly identifies opportunity cost with minor imprecision; may conflate with monetary cost in places"
            },
            {
              "name": "Developing",
              "points": 2,
              "description": "Shows understanding of trade-offs but misidentifies opportunity cost or confuses it with total costs"
            },
            {
              "name": "Beginning",
              "points": 1,
              "description": "Does not demonstrate understanding of opportunity cost; focuses only on monetary costs or benefits"
            }
          ]
        },
        {
          "name": "Authentic Voice",
          "description": "Personal perspective and genuine reflection",
          "weight": 30,
          "category": "authentic_voice",
          "levels": [
            {
              "name": "Exemplary",
              "points": 4,
              "description": "Deeply personal and specific; reader can clearly see the individual's values, context, and thought process; could not have been written by anyone else"
            },
            {
              "name": "Proficient",
              "points": 3,
              "description": "Personal and specific with some generic elements; mostly distinctive voice"
            },
            {
              "name": "Developing",
              "points": 2,
              "description": "Some personal elements but largely generic analysis that could apply to many people"
            },
            {
              "name": "Beginning",
              "points": 1,
              "description": "Generic or hypothetical; no authentic personal voice; could have been written by AI"
            }
          ]
        },
        {
          "name": "Process Quality",
          "description": "Evidence of genuine intellectual work and iteration",
          "weight": 30,
          "category": "process_quality",
          "levels": [
            {
              "name": "Exemplary",
              "points": 4,
              "description": "AI logs show thoughtful engagement; evidence of revision based on feedback; metacognitive awareness of how thinking evolved"
            },
            {
              "name": "Proficient",
              "points": 3,
              "description": "AI logs show appropriate use; some evidence of iteration; basic reflection on process"
            },
            {
              "name": "Developing",
              "points": 2,
              "description": "Minimal AI engagement or AI used inappropriately; little evidence of revision"
            },
            {
              "name": "Beginning",
              "points": 1,
              "description": "No process documentation; appears to be first draft or AI-generated without engagement"
            }
          ]
        }
      ]
    }
  ],

  "prerequisites": {
    "courses": [],
    "skills": [
      {
        "skill": "Basic algebra (solving for x)",
        "proficiency_level": "basic",
        "required": true
      },
      {
        "skill": "Reading graphs and charts",
        "proficiency_level": "basic",
        "required": true
      }
    ],
    "knowledge": [
      {
        "area": "Current events awareness",
        "description": "Basic familiarity with economic news (inflation, jobs reports, etc.)",
        "required": false
      }
    ]
  },

  "context": {
    "ai_policy": {
      "course_level": "permitted_with_attribution",
      "rationale": "Economics requires developing independent analytical thinking, but AI can be a valuable learning tool when used transparently",
      "details": "AI may be used for: explaining concepts, checking understanding, brainstorming, and feedback on drafts. AI may NOT be used for: writing submitted work, completing problem sets, or generating analysis without your own reasoning. All AI use must be disclosed.",
      "skills_to_develop": [
        "Economic reasoning and model-building",
        "Applying theory to real-world situations",
        "Constructing and defending arguments",
        "Quantitative analysis"
      ],
      "skills_to_delegate": [
        "Checking arithmetic",
        "Clarifying confusing concepts",
        "Generating practice problems",
        "Proofreading"
      ]
    },
    "learner_profile": {
      "type": "traditional_undergraduate",
      "typical_background": "First or second year students, many taking this to fulfill a requirement. Mixed math comfort levels.",
      "common_challenges": "Math anxiety, seeing economics as abstract/irrelevant, memorizing rather than understanding",
      "motivations": "Requirement fulfillment, curiosity about 'how the economy works', pre-business or pre-law interests"
    },
    "teaching_approach": {
      "primary": "problem_based",
      "secondary": ["discussion", "lecture"],
      "philosophy": "I believe students learn economics best by wrestling with real problems before receiving formal instruction. We start with puzzles and news stories, develop intuitions, then formalize with models."
    },
    "instructor_persona": {
      "formality": "conversational",
      "encouragement_style": "socratic",
      "feedback_approach": "questioning",
      "phrases_to_use": [
        "What would happen if...",
        "How might someone disagree with that?",
        "Let's think about the incentives here",
        "Good instinct—now let's formalize it"
      ],
      "phrases_to_avoid": [
        "That's wrong",
        "Obviously",
        "As I said before",
        "You should already know this"
      ]
    },
    "discipline_conventions": {
      "citation_style": "APA",
      "terminology_notes": "Use 'quantity demanded' not 'demand' when referring to specific amounts. Distinguish 'shift' from 'movement along' curves.",
      "methodological_conventions": "Ceteris paribus assumptions should be stated explicitly. Models simplify reality intentionally.",
      "ethical_considerations": "Economic analysis describes, it doesn't prescribe. Efficiency is not the only value. Distributional effects matter."
    }
  },

  "learning_paths": [
    {
      "id": "path-standard",
      "name": "Standard Path",
      "description": "Default sequence following syllabus order",
      "target_audience": "Most students",
      "sequence": [
        { "node_id": "concept-scarcity" },
        { "node_id": "concept-opportunity-cost" },
        { "node_id": "concept-tradeoffs" },
        { "node_id": "concept-demand" },
        { "node_id": "concept-supply" },
        { "node_id": "skill-graph-reading" },
        { "node_id": "concept-equilibrium" }
      ]
    },
    {
      "id": "path-math-anxious",
      "name": "Math-Anxious Path",
      "description": "Extra scaffolding for students uncomfortable with graphs",
      "target_audience": "Students with math anxiety",
      "sequence": [
        { "node_id": "concept-scarcity" },
        { "node_id": "concept-opportunity-cost" },
        { "node_id": "skill-graph-reading", "notes": "Spend extra time here with non-economic examples first" },
        { "node_id": "concept-demand", "notes": "Start with tables before curves" },
        { "node_id": "concept-supply" },
        { "node_id": "concept-equilibrium" }
      ]
    }
  ],

  "ai_system_prompt": {
    "full_prompt": "You are a tutor for ECON 101: Principles of Microeconomics at State University...[auto-generated from context]",
    "context_summary": "Intro microeconomics course using problem-based learning. Students should develop economic reasoning skills. AI use permitted with attribution but students must do their own analysis.",
    "module_prompts": {
      "module-1": "For Module 1 (Thinking Like an Economist), use INSTRUCT mode: explain concepts clearly, provide examples, answer questions directly. Key concepts: scarcity, opportunity cost, trade-offs. Watch for misconception that opportunity cost = price.",
      "module-2": "For Module 2 (Supply and Demand), use GUIDE mode: ask questions more than answer, help students discover relationships through Socratic dialogue. Don't give direct answers about equilibrium—guide their reasoning."
    }
  }
}
```

---

## Relationship to Standards

### LRMI/Schema.org Alignment

The schema includes `lrmi_alignment` in the course object for web discoverability:

```json
"lrmi_alignment": {
  "@type": "Course",
  "educationalLevel": "introductory",
  "teaches": ["Economic reasoning", "Supply and demand analysis"],
  "assesses": ["Apply opportunity cost", "Predict market equilibrium"]
}
```

### CTDL-ASN Competency Links

Nodes and competencies can link to external frameworks:

```json
"external_alignments": [
  {
    "framework": "CTDL-ASN",
    "uri": "https://credentialengineregistry.org/competencies/abc123",
    "label": "Analyze market structures"
  }
]
```

### Knowledge Space Theory Compliance

The schema enforces that `prerequisite_of` edges form a valid **Directed Acyclic Graph (DAG)**:

- `is_dag_valid` flag in metadata
- Validation should run on save/export
- Cycles in prerequisites indicate a modeling error

---

## AI Extraction Flow

1. **Upload**: Faculty uploads syllabus (PDF/DOCX/paste)
2. **Extract Modules**: AI identifies 4-8 thematic modules (coarse grain)
3. **Extract Concepts**: AI identifies fine-grained concepts within each module
4. **Infer Relationships**: AI proposes edges based on:
   - Language analysis ("requires understanding of...", "builds on...")
   - Sequence in syllabus
   - Bloom's level progression
   - Common pedagogical patterns in the discipline
5. **Faculty Review**:
   - Nodes marked `ai_extracted` until confirmed
   - Edges have `confidence` scores
   - Faculty can accept, edit, or reject
   - Confirmed items marked `faculty_defined` or `ai_with_faculty_review`
6. **Validate**: System checks DAG validity, coverage, consistency
7. **Export**: JSON, JSON-LD, Markdown, system prompts

---

## Validation Rules

| Rule | Description |
|------|-------------|
| DAG Check | `prerequisite_of` edges cannot form cycles |
| Node Coverage | Every module should have ≥1 concept |
| Assessment Coverage | Every concept should be assessed (warning, not error) |
| Orphan Check | No concept should be disconnected from graph |
| Weight Sum | Assessment weights should sum to 100% |
| ID Uniqueness | All IDs must be unique within their type |

---

## Migration from v0.3

The v0.4 schema is backward-compatible with v0.3:

- Existing modules work unchanged
- `knowledge_graph` is new but optional for migration
- `prerequisites` moved from module-level to dedicated section
- Added `learning_paths` and `ai_system_prompt` sections

To upgrade v0.3 documents:
1. Add empty `knowledge_graph` with `extraction_method: "pending"`
2. Run AI extraction to populate nodes from existing topics
3. Faculty reviews and confirms

---

## Future Extensions (Post-MVP)

- **Graph Visualization**: Interactive node-edge diagram
- **Gap Analysis Dashboard**: Coverage heatmaps
- **Competency Framework Import**: Bulk import from CTDL registries
- **Cross-Course Graphs**: Link prerequisites across courses
- **Student Mastery Tracking**: Runtime state on the graph (which nodes mastered)
- **Adaptive Path Generation**: Auto-generate paths based on student profile
