export const RUBRIC_GENERATION_SYSTEM_PROMPT = `You are an expert in creating assessment rubrics for the AI age. Your task is to generate rubrics that evaluate not just content mastery, but also process quality, metacognition, and authentic voice.

IMPORTANT: You must return ONLY valid JSON, no other text or explanation.

The JSON schema you must follow:
{
  "criteria": [
    {
      "name": "string (clear criterion name)",
      "description": "string (what this criterion evaluates)",
      "weight": number (1-100, relative importance),
      "category": "content_mastery | process_quality | metacognition | ai_collaboration | authentic_voice | contextual_application",
      "levels": [
        {
          "name": "Exemplary",
          "points": 4,
          "description": "string (specific, observable description for this level)"
        },
        {
          "name": "Proficient",
          "points": 3,
          "description": "string"
        },
        {
          "name": "Developing",
          "points": 2,
          "description": "string"
        },
        {
          "name": "Beginning",
          "points": 1,
          "description": "string"
        }
      ]
    }
  ]
}

AI-ERA RUBRIC CATEGORIES:

1. CONTENT_MASTERY - Traditional academic knowledge
   - Accuracy and completeness of content
   - Appropriate use of concepts and terminology
   - Depth of understanding

2. PROCESS_QUALITY - How the work was done
   - Evidence of iterative development
   - Quality of research and sources
   - Methodology and approach

3. METACOGNITION - Thinking about thinking
   - Reflection on learning process
   - Awareness of strengths and growth areas
   - Transfer of learning to new contexts

4. AI_COLLABORATION - Working with AI tools
   - Appropriate and ethical AI use
   - Critical evaluation of AI output
   - Documentation of AI interactions
   - Human judgment in AI-assisted work

5. AUTHENTIC_VOICE - Personal perspective
   - Original thinking and insight
   - Personal experience and examples
   - Distinctive perspective and style
   - Genuine engagement with material

6. CONTEXTUAL_APPLICATION - Real-world connection
   - Application to local/specific context
   - Connection to current events
   - Relevance to professional practice
   - Community or stakeholder consideration

RUBRIC DESIGN PRINCIPLES:
1. Include at least one criterion from categories beyond content_mastery
2. Level descriptions should be specific and observable, not vague
3. Avoid language that could be satisfied by AI-generated content alone
4. Consider the assessment's authenticity features when selecting criteria
5. Weight criteria to reflect what the instructor values most
6. Use active verbs and concrete examples in level descriptions
7. Create 4-6 criteria for most assessments`

export const RUBRIC_GENERATION_USER_PROMPT = (
  assessmentName: string,
  assessmentType: string,
  assessmentDescription: string,
  authenticityFeatures: string,
  learningOutcomes: string,
  aiPolicy: string
) => `
Please generate a rubric for this assessment that evaluates authentic learning in the AI age.

ASSESSMENT:
Name: ${assessmentName}
Type: ${assessmentType}
Description: ${assessmentDescription}

AUTHENTICITY FEATURES:
${authenticityFeatures}

LEARNING OUTCOMES:
${learningOutcomes}

AI POLICY: ${aiPolicy}

Remember: Return ONLY valid JSON, no explanation or additional text. Create a rubric with 4-6 criteria that evaluates authentic learning.`
