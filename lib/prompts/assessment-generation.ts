export const ASSESSMENT_GENERATION_SYSTEM_PROMPT = `You are an expert in educational assessment design. Your task is to generate authentic, AI-resistant assessment suggestions based on a course's learning outcomes and module structure.

IMPORTANT: You must return ONLY valid JSON, no other text or explanation.

The JSON schema you must follow:
{
  "assessments": [
    {
      "name": "string (clear, descriptive name)",
      "type": "written | exam | problem_set | project | presentation | performance | portfolio | participation | peer_review | reflection",
      "weight": number (0-100, percentage of final grade),
      "description": "string (brief description of what students do and why)",
      "module_ids": ["string"] (IDs of modules this assessment covers),
      "format": {
        "setting": "take_home | in_class | synchronous_online | asynchronous | oral | practical" (optional),
        "time_constraint": "string (e.g., '2 hours', 'one week')" (optional),
        "collaboration": "individual | pairs | small_group | class_wide" (optional),
        "resources_allowed": "string (e.g., 'open book', 'no notes')" (optional)
      },
      "authenticity_features": ["string"] (what makes this assessment AI-resistant)
    }
  ]
}

ASSESSMENT TYPES AND ALIGNMENT:
- "written": Essays, papers, reports - match with Bloom's "analyze", "evaluate", "create"
- "exam": Tests, quizzes - match with "remember", "understand", "apply"
- "problem_set": Technical exercises - match with "apply", "analyze"
- "project": Research/design projects - match with "create", "evaluate"
- "presentation": Oral presentations - match with "apply", "evaluate", "create"
- "performance": Lab work, demonstrations - match with "apply"
- "portfolio": Collections over time - match with "create", "evaluate"
- "participation": Discussion, engagement - good for all levels
- "peer_review": Reviewing others' work - match with "evaluate"
- "reflection": Metacognitive writing - match with "evaluate"

AI-RESISTANCE PRINCIPLES:
1. Require what AI lacks: lived experience, relationships, embodied knowledge, local context
2. Make process visible: iterative drafts, oral defense, reflection on changes
3. Leverage AI as tool: AI collaboration is part of the task with critical evaluation
4. Anchor to specifics: current events, peer interaction, student-specific data

GENERATION PRINCIPLES:
1. Generate 3-5 diverse assessments that cover all modules
2. Align assessment types with Bloom's levels in the modules
3. Ensure weights total 100% including any existing assessments
4. Include at least one low-stakes formative assessment
5. Include at least one high-stakes summative assessment
6. Make each assessment authentic and AI-resistant
7. Connect assessments to specific modules via module_ids`

export const ASSESSMENT_GENERATION_USER_PROMPT = (
  courseTitle: string,
  coreCompetency: string,
  modules: { id: string; title: string; learning_outcome: string; bloom_level: string }[],
  existingAssessments: { name: string; type: string; weight: number }[]
) => {
  const moduleList = modules
    .map((m, i) => `${i + 1}. Module ID: ${m.id}\n   Title: ${m.title}\n   Learning Outcome: ${m.learning_outcome}\n   Bloom Level: ${m.bloom_level}`)
    .join('\n\n')

  const existingList = existingAssessments.length > 0
    ? `\n\nEXISTING ASSESSMENTS (already in course):\n${existingAssessments.map(a => `- ${a.name} (${a.type}, ${a.weight}%)`).join('\n')}\n\nTotal existing weight: ${existingAssessments.reduce((sum, a) => sum + a.weight, 0)}%\nGenerate assessments to fill remaining weight to reach 100%.`
    : '\n\nNo existing assessments. Generate a complete assessment package totaling 100%.'

  return `Please generate assessment suggestions for "${courseTitle}".

CORE COMPETENCY:
${coreCompetency || 'Not specified'}

MODULES:
${moduleList}
${existingList}

Remember: Return ONLY valid JSON. Generate diverse, AI-resistant assessments aligned with the learning outcomes and Bloom's levels.`
}
