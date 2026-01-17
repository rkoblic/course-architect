import type {
  Course,
  CoreCompetency,
  Module,
  KnowledgeNode,
  KnowledgeEdge,
  AIPolicy,
  LearnerProfile,
  Prerequisites,
} from '@/types/schema'

/**
 * Minimal demo data for testing the UI flow without API calls.
 * Just enough to walk through all 6 steps of the Unpack flow.
 */

export const demoCourse: Partial<Course> = {
  title: 'Introduction to Data Science',
  code: 'DS 101',
  discipline: 'Computer Science',
  subdiscipline: 'Data Science',
  level: 'introductory',
  credits: 3,
  duration: '15 weeks',
  delivery_mode: 'hybrid',
}

export const demoCoreCompetency: Partial<CoreCompetency> = {
  statement: 'Apply fundamental data science techniques to analyze real-world datasets and communicate insights effectively.',
  type: 'integrated',
}

export const demoModules: Module[] = [
  {
    id: 'module-demo-1',
    sequence: 1,
    title: 'Foundations of Data',
    description: 'Introduction to data types, structures, and basic manipulation techniques.',
    learning_outcome: 'Identify and describe different data types and apply appropriate data structures for various analytical tasks.',
    bloom_level: 'understand',
    ai_partnership_mode: 'instruct',
    topics: ['Data types', 'Data structures', 'Data cleaning'],
    estimated_duration: '3 weeks',
  },
  {
    id: 'module-demo-2',
    sequence: 2,
    title: 'Exploratory Data Analysis',
    description: 'Techniques for exploring and visualizing datasets to uncover patterns.',
    learning_outcome: 'Conduct exploratory data analysis using visualization and summary statistics to identify patterns and anomalies.',
    bloom_level: 'apply',
    ai_partnership_mode: 'assist',
    topics: ['Summary statistics', 'Data visualization', 'Pattern recognition'],
    estimated_duration: '4 weeks',
  },
  {
    id: 'module-demo-3',
    sequence: 3,
    title: 'Introduction to Machine Learning',
    description: 'Foundational machine learning concepts and simple predictive models.',
    learning_outcome: 'Build and evaluate basic machine learning models to make predictions from data.',
    bloom_level: 'apply',
    ai_partnership_mode: 'collaborate',
    topics: ['Supervised learning', 'Model evaluation', 'Regression', 'Classification'],
    estimated_duration: '5 weeks',
  },
]

export const demoNodes: KnowledgeNode[] = [
  {
    id: 'node-demo-1',
    type: 'concept',
    label: 'Data Types',
    description: 'Understanding numeric, categorical, ordinal, and text data',
    bloom_level: 'understand',
    difficulty: 'foundational',
    parent_module_id: 'module-demo-1',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-2',
    type: 'skill',
    label: 'Data Cleaning',
    description: 'Handling missing values, outliers, and data inconsistencies',
    bloom_level: 'apply',
    difficulty: 'foundational',
    parent_module_id: 'module-demo-1',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-3',
    type: 'concept',
    label: 'Statistical Measures',
    description: 'Mean, median, mode, variance, and standard deviation',
    bloom_level: 'understand',
    difficulty: 'foundational',
    parent_module_id: 'module-demo-2',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-4',
    type: 'skill',
    label: 'Data Visualization',
    description: 'Creating effective charts and graphs to communicate data insights',
    bloom_level: 'apply',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-2',
    source: 'ai_extracted',
    confirmed: true,
  },
]

export const demoEdges: KnowledgeEdge[] = [
  {
    id: 'edge-demo-1',
    source: 'node-demo-1',
    target: 'node-demo-2',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.9,
    rationale: 'Understanding data types is essential before learning to clean data',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'edge-demo-2',
    source: 'node-demo-2',
    target: 'node-demo-3',
    relationship: 'prerequisite_of',
    strength: 'recommended',
    confidence: 0.8,
    rationale: 'Clean data is needed for accurate statistical analysis',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'edge-demo-3',
    source: 'node-demo-3',
    target: 'node-demo-4',
    relationship: 'builds_on',
    strength: 'recommended',
    confidence: 0.85,
    rationale: 'Statistical understanding helps create meaningful visualizations',
    source_type: 'ai_extracted',
    confirmed: true,
  },
]

export const demoAIPolicy: Partial<AIPolicy> = {
  course_level: 'permitted_with_attribution',
  rationale: 'AI tools are increasingly used in professional data science work. Students should learn to use them responsibly.',
  details: 'AI may be used for code assistance and debugging. All AI-generated content must be disclosed and critically evaluated.',
  skills_to_develop: ['Critical evaluation of AI outputs', 'Prompt engineering', 'Data interpretation'],
  skills_to_delegate: ['Boilerplate code generation', 'Syntax debugging', 'Documentation formatting'],
}

export const demoLearnerProfile: Partial<LearnerProfile> = {
  type: 'traditional_undergraduate',
  typical_background: 'Students with basic programming knowledge (intro CS course)',
  common_challenges: 'Mathematical notation, statistical concepts, debugging code',
  motivations: 'Career opportunities in tech and analytics',
}

export const demoPrerequisites: Partial<Prerequisites> = {
  courses: [
    {
      code: 'CS 101',
      title: 'Introduction to Programming',
      required: true,
      concepts_assumed: ['Variables', 'Loops', 'Functions'],
    },
  ],
  skills: [
    {
      skill: 'Basic Python programming',
      proficiency_level: 'basic',
      required: true,
    },
  ],
  knowledge: [
    {
      area: 'Basic algebra',
      description: 'Understanding of variables, equations, and graphing',
      required: true,
    },
  ],
}

export const demoSyllabusText = `
INTRODUCTION TO DATA SCIENCE (DS 101)
3 Credits | Hybrid Delivery

Course Description:
This introductory course provides students with foundational skills in data science,
including data manipulation, exploratory analysis, and basic machine learning concepts.

Learning Objectives:
- Understand different data types and structures
- Apply data cleaning techniques
- Conduct exploratory data analysis
- Build simple predictive models

Prerequisites: CS 101 (Introduction to Programming)

Module 1: Foundations of Data (Weeks 1-3)
Module 2: Exploratory Data Analysis (Weeks 4-7)
Module 3: Introduction to Machine Learning (Weeks 8-12)
Final Project Presentations (Weeks 13-15)
`.trim()
