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
 * Demo data for testing the UI flow without API calls.
 * Represents a realistic Introduction to Data Science course.
 */

export const demoSyllabusText = `
INTRODUCTION TO DATA SCIENCE
DS 101 | Fall 2024
Department of Computer Science

Credits: 3
Schedule: Tuesday/Thursday 10:00-11:15 AM
Location: Science Building 302 (in-person) + Zoom option available
Instructor: Dr. Sarah Chen
Office Hours: Wednesday 2-4 PM or by appointment

COURSE DESCRIPTION
This introductory course provides students with foundational skills in data science, bridging programming, statistics, and domain knowledge. Students will learn to collect, clean, analyze, and visualize data using Python and modern data science tools. The course emphasizes practical, hands-on experience with real-world datasets while building theoretical understanding of key concepts.

By the end of this course, students will be able to apply the complete data science workflow—from data acquisition through insight communication—to solve authentic problems in their chosen domain.

LEARNING OBJECTIVES
Upon successful completion of this course, students will be able to:
1. Understand and manipulate different data types and structures in Python
2. Apply data cleaning and preprocessing techniques to prepare messy real-world data
3. Conduct exploratory data analysis using statistical methods and visualization
4. Build, evaluate, and interpret basic machine learning models
5. Communicate data insights effectively through visualizations and written reports
6. Apply ethical reasoning to data collection, analysis, and use
7. Collaborate effectively using version control and reproducible workflows

PREREQUISITES
- CS 101: Introduction to Programming (required)
- MATH 150: College Algebra (required)
- STAT 100: Introduction to Statistics (recommended)

REQUIRED MATERIALS
- "Python for Data Analysis" by Wes McKinney (3rd Edition)
- Laptop with Python 3.9+ and Jupyter Notebook installed
- GitHub account for assignment submission

COURSE SCHEDULE

Week 1-2: Module 1 - Python Foundations for Data Science
- Python data structures: lists, dictionaries, tuples, sets
- NumPy arrays and vectorized operations
- Introduction to Pandas DataFrames
- Reading data from CSV, JSON, and Excel files
- Assignment 1: Data Loading and Basic Manipulation

Week 3-4: Module 2 - Data Cleaning and Preprocessing
- Handling missing values: detection, imputation strategies
- Dealing with outliers and anomalies
- Data type conversions and formatting
- String manipulation and text cleaning
- Merging and joining datasets
- Assignment 2: Cleaning a Messy Dataset

Week 5-6: Module 3 - Exploratory Data Analysis
- Descriptive statistics: measures of center and spread
- Data distributions and normality
- Correlation analysis
- Grouping and aggregation operations
- Hypothesis formulation from data exploration
- Assignment 3: EDA Report on Real Dataset

Week 7-8: Module 4 - Data Visualization
- Principles of effective data visualization
- Matplotlib fundamentals
- Statistical visualization with Seaborn
- Interactive visualizations with Plotly
- Choosing the right chart for your data
- Dashboard creation basics
- Assignment 4: Visualization Portfolio

Week 9: Module 5 - Statistical Inference for Data Science
- Sampling and sampling distributions
- Confidence intervals
- Hypothesis testing basics
- A/B testing framework
- Common statistical pitfalls
- Midterm Project Due

Week 10-11: Module 6 - Introduction to Machine Learning
- Supervised vs. unsupervised learning
- The machine learning workflow
- Train/test splits and cross-validation
- Linear regression: theory and implementation
- Logistic regression for classification
- Model evaluation metrics: accuracy, precision, recall, F1
- Assignment 5: Build Your First ML Model

Week 12-13: Module 7 - Advanced Topics and Ethics
- Introduction to decision trees and random forests
- Feature engineering and selection
- Overfitting and regularization
- Ethics in data science: bias, privacy, consent
- Responsible AI practices
- Case studies in data ethics
- Assignment 6: Ethics Case Study Analysis

Week 14-15: Final Project
- Team project applying full data science workflow
- Dataset selection and problem definition
- Analysis and modeling
- Final presentation and report
- Peer review and feedback

ASSESSMENT
- Weekly Assignments (6): 30%
- Midterm Project: 20%
- Final Project: 30%
- Class Participation: 10%
- Peer Reviews: 10%

AI POLICY
AI tools (such as ChatGPT, GitHub Copilot, Claude) are permitted in this course with proper attribution. Data science professionals increasingly use AI assistants, and learning to work effectively with these tools is valuable. However:
- All AI-assisted work must be disclosed
- You must understand and be able to explain any AI-generated code
- AI should augment your learning, not replace it
- Certain assessments may restrict AI use (will be clearly marked)

Skills to develop yourself: critical thinking, problem formulation, interpretation, communication
Skills where AI assistance is appropriate: code syntax, debugging, documentation, boilerplate code

ACADEMIC INTEGRITY
While collaboration and AI assistance are encouraged within guidelines, submitting others' work as your own is a violation of academic integrity. When in doubt, ask.
`.trim()

export const demoCourse: Partial<Course> = {
  title: 'Introduction to Data Science',
  code: 'DS 101',
  institution: 'State University',
  discipline: 'Computer Science',
  subdiscipline: 'Data Science',
  level: 'introductory',
  credits: 3,
  duration: '15 weeks',
  delivery_mode: 'hybrid',
}

export const demoCoreCompetency: Partial<CoreCompetency> = {
  statement: 'Apply the complete data science workflow—from data acquisition through insight communication—to solve authentic problems using Python, statistical reasoning, and ethical judgment.',
  type: 'integrated',
}

export const demoModules: Module[] = [
  {
    id: 'module-demo-1',
    sequence: 1,
    title: 'Python Foundations for Data Science',
    description: 'Core Python data structures and libraries for data manipulation, including NumPy arrays and Pandas DataFrames.',
    learning_outcome: 'Manipulate data using Python data structures, NumPy arrays, and Pandas DataFrames to load and transform datasets from various file formats.',
    bloom_level: 'apply',
    ai_partnership_mode: 'instruct',
    topics: ['Python data structures', 'NumPy arrays', 'Pandas DataFrames', 'File I/O'],
    estimated_duration: '2 weeks',
  },
  {
    id: 'module-demo-2',
    sequence: 2,
    title: 'Data Cleaning and Preprocessing',
    description: 'Techniques for handling messy real-world data, including missing values, outliers, and data integration.',
    learning_outcome: 'Apply data cleaning techniques to transform messy real-world datasets into analysis-ready formats.',
    bloom_level: 'apply',
    ai_partnership_mode: 'assist',
    topics: ['Missing values', 'Outlier detection', 'Data type conversion', 'String manipulation', 'Data merging'],
    estimated_duration: '2 weeks',
  },
  {
    id: 'module-demo-3',
    sequence: 3,
    title: 'Exploratory Data Analysis',
    description: 'Statistical methods and techniques for exploring datasets and discovering patterns before formal modeling.',
    learning_outcome: 'Conduct exploratory data analysis using descriptive statistics and correlation analysis to formulate hypotheses about data relationships.',
    bloom_level: 'analyze',
    ai_partnership_mode: 'assist',
    topics: ['Descriptive statistics', 'Data distributions', 'Correlation analysis', 'Grouping and aggregation'],
    estimated_duration: '2 weeks',
  },
  {
    id: 'module-demo-4',
    sequence: 4,
    title: 'Data Visualization',
    description: 'Principles and tools for creating effective visual representations of data insights.',
    learning_outcome: 'Create effective data visualizations using Matplotlib, Seaborn, and Plotly that communicate insights clearly to diverse audiences.',
    bloom_level: 'create',
    ai_partnership_mode: 'collaborate',
    topics: ['Visualization principles', 'Matplotlib', 'Seaborn', 'Plotly', 'Chart selection', 'Dashboards'],
    estimated_duration: '2 weeks',
  },
  {
    id: 'module-demo-5',
    sequence: 5,
    title: 'Statistical Inference for Data Science',
    description: 'Foundational statistical concepts for drawing conclusions from data samples.',
    learning_outcome: 'Apply statistical inference techniques including confidence intervals and hypothesis testing to draw valid conclusions from sample data.',
    bloom_level: 'apply',
    ai_partnership_mode: 'guide',
    topics: ['Sampling distributions', 'Confidence intervals', 'Hypothesis testing', 'A/B testing'],
    estimated_duration: '1 week',
  },
  {
    id: 'module-demo-6',
    sequence: 6,
    title: 'Introduction to Machine Learning',
    description: 'Fundamentals of supervised learning, including regression and classification models.',
    learning_outcome: 'Build and evaluate linear regression and logistic regression models using appropriate train/test methodology and performance metrics.',
    bloom_level: 'apply',
    ai_partnership_mode: 'collaborate',
    topics: ['ML workflow', 'Train/test splits', 'Cross-validation', 'Linear regression', 'Logistic regression', 'Model evaluation'],
    estimated_duration: '2 weeks',
  },
  {
    id: 'module-demo-7',
    sequence: 7,
    title: 'Advanced Topics and Ethics',
    description: 'Tree-based models, feature engineering, and ethical considerations in data science practice.',
    learning_outcome: 'Evaluate ethical implications of data science projects and apply responsible AI practices to prevent bias and protect privacy.',
    bloom_level: 'evaluate',
    ai_partnership_mode: 'guide',
    topics: ['Decision trees', 'Random forests', 'Feature engineering', 'Overfitting', 'Data ethics', 'Bias', 'Privacy'],
    estimated_duration: '2 weeks',
  },
]

export const demoNodes: KnowledgeNode[] = [
  // Module 1 nodes
  {
    id: 'node-demo-1',
    type: 'concept',
    label: 'Python Data Structures',
    description: 'Lists, dictionaries, tuples, and sets for organizing data in Python',
    bloom_level: 'understand',
    difficulty: 'foundational',
    parent_module_id: 'module-demo-1',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-2',
    type: 'skill',
    label: 'NumPy Array Operations',
    description: 'Creating, indexing, and performing vectorized operations on NumPy arrays',
    bloom_level: 'apply',
    difficulty: 'foundational',
    parent_module_id: 'module-demo-1',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-3',
    type: 'skill',
    label: 'Pandas DataFrame Manipulation',
    description: 'Loading, selecting, filtering, and transforming data using Pandas',
    bloom_level: 'apply',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-1',
    source: 'ai_extracted',
    confirmed: true,
  },
  // Module 2 nodes
  {
    id: 'node-demo-4',
    type: 'skill',
    label: 'Missing Value Handling',
    description: 'Detecting and imputing missing data using various strategies',
    bloom_level: 'apply',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-2',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-5',
    type: 'skill',
    label: 'Outlier Detection',
    description: 'Identifying and handling anomalous values in datasets',
    bloom_level: 'analyze',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-2',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-6',
    type: 'skill',
    label: 'Data Integration',
    description: 'Merging and joining datasets from multiple sources',
    bloom_level: 'apply',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-2',
    source: 'ai_extracted',
    confirmed: true,
  },
  // Module 3 nodes
  {
    id: 'node-demo-7',
    type: 'concept',
    label: 'Descriptive Statistics',
    description: 'Measures of central tendency (mean, median, mode) and spread (variance, standard deviation)',
    bloom_level: 'understand',
    difficulty: 'foundational',
    parent_module_id: 'module-demo-3',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-8',
    type: 'concept',
    label: 'Correlation Analysis',
    description: 'Measuring and interpreting relationships between variables',
    bloom_level: 'analyze',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-3',
    source: 'ai_extracted',
    confirmed: true,
  },
  // Module 4 nodes
  {
    id: 'node-demo-9',
    type: 'concept',
    label: 'Visualization Principles',
    description: 'Design principles for effective and honest data visualization',
    bloom_level: 'understand',
    difficulty: 'foundational',
    parent_module_id: 'module-demo-4',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-10',
    type: 'skill',
    label: 'Statistical Plotting',
    description: 'Creating statistical visualizations using Matplotlib and Seaborn',
    bloom_level: 'apply',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-4',
    source: 'ai_extracted',
    confirmed: true,
  },
  // Module 5 nodes
  {
    id: 'node-demo-11',
    type: 'concept',
    label: 'Sampling Distributions',
    description: 'Understanding how sample statistics vary and the central limit theorem',
    bloom_level: 'understand',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-5',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-12',
    type: 'skill',
    label: 'Hypothesis Testing',
    description: 'Formulating and testing statistical hypotheses using p-values',
    bloom_level: 'apply',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-5',
    source: 'ai_extracted',
    confirmed: true,
  },
  // Module 6 nodes
  {
    id: 'node-demo-13',
    type: 'concept',
    label: 'Supervised Learning',
    description: 'Learning from labeled data to make predictions',
    bloom_level: 'understand',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-6',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-14',
    type: 'skill',
    label: 'Model Training and Evaluation',
    description: 'Train/test splits, cross-validation, and performance metrics',
    bloom_level: 'apply',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-6',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-15',
    type: 'threshold_concept',
    label: 'Bias-Variance Tradeoff',
    description: 'Understanding the fundamental tradeoff between model complexity and generalization',
    bloom_level: 'analyze',
    difficulty: 'advanced',
    parent_module_id: 'module-demo-6',
    common_misconceptions: ['More complex models are always better', 'Training accuracy equals real-world performance'],
    source: 'ai_extracted',
    confirmed: true,
  },
  // Module 7 nodes
  {
    id: 'node-demo-16',
    type: 'concept',
    label: 'Feature Engineering',
    description: 'Creating and selecting features to improve model performance',
    bloom_level: 'create',
    difficulty: 'advanced',
    parent_module_id: 'module-demo-7',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-17',
    type: 'concept',
    label: 'Data Ethics',
    description: 'Ethical considerations in data collection, analysis, and use including bias, privacy, and consent',
    bloom_level: 'evaluate',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-7',
    source: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'node-demo-18',
    type: 'misconception',
    label: 'Algorithmic Neutrality',
    description: 'The false belief that algorithms are inherently objective and unbiased',
    bloom_level: 'evaluate',
    difficulty: 'intermediate',
    parent_module_id: 'module-demo-7',
    source: 'ai_extracted',
    confirmed: true,
  },
]

export const demoEdges: KnowledgeEdge[] = [
  // Module 1 internal edges
  {
    id: 'edge-demo-1',
    source: 'node-demo-1',
    target: 'node-demo-2',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.95,
    rationale: 'Understanding Python data structures is essential before learning NumPy arrays',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'edge-demo-2',
    source: 'node-demo-2',
    target: 'node-demo-3',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.9,
    rationale: 'NumPy array operations are foundational to Pandas which is built on NumPy',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  // Module 1 -> Module 2 edges
  {
    id: 'edge-demo-3',
    source: 'node-demo-3',
    target: 'node-demo-4',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.95,
    rationale: 'DataFrame manipulation skills are needed for handling missing values',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'edge-demo-4',
    source: 'node-demo-3',
    target: 'node-demo-5',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.9,
    rationale: 'Need to be able to manipulate data to detect outliers',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'edge-demo-5',
    source: 'node-demo-3',
    target: 'node-demo-6',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.95,
    rationale: 'Data integration requires proficiency with DataFrame operations',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  // Module 2 -> Module 3 edges
  {
    id: 'edge-demo-6',
    source: 'node-demo-4',
    target: 'node-demo-7',
    relationship: 'prerequisite_of',
    strength: 'recommended',
    confidence: 0.85,
    rationale: 'Clean data is necessary for accurate statistical calculations',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'edge-demo-7',
    source: 'node-demo-7',
    target: 'node-demo-8',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.9,
    rationale: 'Need to understand basic statistics before correlation analysis',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  // Module 3 -> Module 4 edges
  {
    id: 'edge-demo-8',
    source: 'node-demo-7',
    target: 'node-demo-10',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.85,
    rationale: 'Understanding statistics is essential for creating statistical visualizations',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'edge-demo-9',
    source: 'node-demo-9',
    target: 'node-demo-10',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.9,
    rationale: 'Visualization principles guide effective chart creation',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  // Module 3/4 -> Module 5 edges
  {
    id: 'edge-demo-10',
    source: 'node-demo-7',
    target: 'node-demo-11',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.95,
    rationale: 'Descriptive statistics are foundational to understanding sampling distributions',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'edge-demo-11',
    source: 'node-demo-11',
    target: 'node-demo-12',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.95,
    rationale: 'Understanding sampling distributions is essential for hypothesis testing',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  // Module 5 -> Module 6 edges
  {
    id: 'edge-demo-12',
    source: 'node-demo-12',
    target: 'node-demo-14',
    relationship: 'builds_on',
    strength: 'recommended',
    confidence: 0.8,
    rationale: 'Statistical testing concepts inform model evaluation practices',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'edge-demo-13',
    source: 'node-demo-8',
    target: 'node-demo-13',
    relationship: 'prerequisite_of',
    strength: 'recommended',
    confidence: 0.85,
    rationale: 'Understanding correlations helps with supervised learning intuition',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'edge-demo-14',
    source: 'node-demo-13',
    target: 'node-demo-14',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.95,
    rationale: 'Must understand supervised learning concepts before training models',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'edge-demo-15',
    source: 'node-demo-14',
    target: 'node-demo-15',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.9,
    rationale: 'Need experience with model evaluation to understand bias-variance tradeoff',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  // Module 6 -> Module 7 edges
  {
    id: 'edge-demo-16',
    source: 'node-demo-15',
    target: 'node-demo-16',
    relationship: 'prerequisite_of',
    strength: 'required',
    confidence: 0.85,
    rationale: 'Understanding overfitting is essential for effective feature engineering',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  {
    id: 'edge-demo-17',
    source: 'node-demo-17',
    target: 'node-demo-18',
    relationship: 'addresses_misconception',
    strength: 'required',
    confidence: 0.9,
    rationale: 'Data ethics education directly addresses the misconception of algorithmic neutrality',
    source_type: 'ai_extracted',
    confirmed: true,
  },
  // Cross-cutting connections
  {
    id: 'edge-demo-18',
    source: 'node-demo-10',
    target: 'node-demo-17',
    relationship: 'related_to',
    strength: 'recommended',
    confidence: 0.75,
    rationale: 'Visualization choices can introduce or reveal bias in data presentation',
    source_type: 'ai_extracted',
    confirmed: true,
  },
]

export const demoAIPolicy: Partial<AIPolicy> = {
  course_level: 'permitted_with_attribution',
  rationale: 'AI tools are increasingly used in professional data science work. Students should learn to use them responsibly while developing core competencies.',
  details: 'AI assistants (ChatGPT, GitHub Copilot, Claude) may be used for code assistance, debugging, and documentation. All AI-assisted work must be disclosed. Students must understand and be able to explain any AI-generated code. Certain assessments may restrict AI use and will be clearly marked.',
  skills_to_develop: ['Critical thinking', 'Problem formulation', 'Data interpretation', 'Communication', 'Ethical reasoning'],
  skills_to_delegate: ['Code syntax', 'Debugging', 'Documentation', 'Boilerplate code', 'Formatting'],
}

export const demoLearnerProfile: Partial<LearnerProfile> = {
  type: 'traditional_undergraduate',
  typical_background: 'Sophomore or junior students with one programming course (CS 101) and basic algebra. Most have limited statistics background. Mix of CS majors and students from other disciplines interested in data skills.',
  common_challenges: 'Mathematical notation, statistical intuition, debugging code, connecting theory to practice, managing large datasets',
  motivations: 'Career opportunities in tech and analytics, desire to work with data in their major field, curiosity about AI/ML',
}

export const demoPrerequisites: Partial<Prerequisites> = {
  courses: [
    {
      code: 'CS 101',
      title: 'Introduction to Programming',
      required: true,
      concepts_assumed: ['Variables and data types', 'Control flow (loops, conditionals)', 'Functions', 'Basic debugging'],
    },
    {
      code: 'MATH 150',
      title: 'College Algebra',
      required: true,
      concepts_assumed: ['Linear equations', 'Functions and graphs', 'Basic notation'],
    },
    {
      code: 'STAT 100',
      title: 'Introduction to Statistics',
      required: false,
      concepts_assumed: ['Mean and standard deviation', 'Basic probability', 'Normal distribution'],
    },
  ],
  skills: [
    {
      skill: 'Python programming',
      proficiency_level: 'basic',
      required: true,
    },
    {
      skill: 'Command line navigation',
      proficiency_level: 'basic',
      required: false,
    },
  ],
  knowledge: [
    {
      area: 'Basic algebra and functions',
      description: 'Comfort with variables, equations, and graphing linear relationships',
      required: true,
    },
    {
      area: 'Spreadsheet fundamentals',
      description: 'Basic familiarity with tabular data from Excel or Google Sheets',
      required: false,
    },
  ],
}
