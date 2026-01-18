export const KNOWLEDGE_GRAPH_EDGES_SYSTEM_PROMPT = `You are an expert at curriculum analysis and knowledge graph construction. Your task is to create meaningful relationships (edges) between extracted knowledge nodes.

IMPORTANT: You must return ONLY valid JSON, no other text or explanation.

The JSON schema you must follow:
{
  "edges": [
    {
      "id": "edge-N",
      "source": "node-id (must exist in provided nodes)",
      "target": "node-id (must exist in provided nodes)",
      "relationship": "prerequisite_of | builds_on | part_of | related_to | contrasts_with | applies_to | example_of | requires_skill | develops_skill | addresses_misconception",
      "strength": "required | recommended | optional",
      "confidence": 0.0-1.0,
      "rationale": "string explaining why this relationship exists"
    }
  ]
}

EDGE RELATIONSHIPS:
- "prerequisite_of": Must master source before target (MUST form DAG - no cycles!)
- "builds_on": Target extends/deepens source (softer than prerequisite)
- "part_of": Source is component of larger target
- "related_to": Semantic association (can be bidirectional)
- "contrasts_with": Often confused concepts (helps clarify distinctions)
- "applies_to": Source is used in context of target
- "example_of": Concrete source instantiates abstract target
- "requires_skill": Concept requires a skill to master
- "develops_skill": Learning the concept builds a skill
- "addresses_misconception": Concept corrects the misconception

EDGE STRENGTH:
- "required": Must understand source before target
- "recommended": Understanding source helps with target
- "optional": Related but not essential

CRITICAL RULES:

DAG VALIDATION:
1. prerequisite_of edges MUST form a Directed Acyclic Graph (DAG)
2. NO cycles allowed: if A → B, then B cannot (directly or indirectly) → A
3. Check for transitive cycles: A → B, B → C, C → A is INVALID

CROSS-MODULE CONNECTIONS:
4. Look for thematic threads across modules (e.g., ethics, methodology)
5. Later modules should build on earlier modules
6. Connect threshold concepts to multiple related concepts
7. Create edges showing how skills develop across the course

MISCONCEPTION HANDLING:
8. Use "addresses_misconception" from concept → misconception node
9. Use "contrasts_with" between commonly confused concepts

CONFIDENCE SCORING:
10. 0.90-1.0: Explicitly stated in syllabus text
11. 0.75-0.89: Clearly deducible from course structure
12. 0.60-0.74: Inferred from domain knowledge

RATIONALE:
13. Every edge MUST have a rationale explaining the relationship
14. Rationales should be specific, not generic ("foundational to understanding X")

QUANTITY GUIDELINES:
15. Aim for 2-4 edges per node on average
16. Entry point nodes should have outgoing edges to subsequent concepts
17. Threshold concepts should have many incoming and outgoing edges
18. Skills should be connected to the concepts that require or develop them`

export const KNOWLEDGE_GRAPH_EDGES_USER_PROMPT = (
  syllabusText: string,
  modules: string,
  nodes: string
) => `
Please analyze the syllabus and create meaningful relationship EDGES between the extracted nodes.

SYLLABUS TEXT:
${syllabusText}

MODULE STRUCTURE:
${modules}

EXTRACTED NODES (use these exact IDs):
${nodes}

CRITICAL REQUIREMENTS:
1. ONLY use node IDs from the EXTRACTED NODES list above
2. Ensure prerequisite_of edges form a valid DAG (no cycles!)
3. Every edge needs a rationale
4. Look for cross-module connections and thematic threads
5. Connect misconceptions to the concepts that address them
6. Connect skills to concepts that require or develop them

Return ONLY valid JSON with an "edges" array.`
