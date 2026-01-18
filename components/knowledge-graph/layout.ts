import dagre from 'dagre'
import type { Node, Edge } from 'reactflow'

export interface LayoutOptions {
  direction: 'TB' | 'LR' | 'BT' | 'RL'
  nodeWidth: number
  nodeHeight: number
  rankSep: number
  nodeSep: number
}

const defaultOptions: LayoutOptions = {
  direction: 'TB', // Top to bottom
  nodeWidth: 200,
  nodeHeight: 80,
  rankSep: 80, // Vertical spacing between ranks
  nodeSep: 40, // Horizontal spacing between nodes
}

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: Partial<LayoutOptions> = {}
): { nodes: Node[]; edges: Edge[] } {
  const opts = { ...defaultOptions, ...options }

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  dagreGraph.setGraph({
    rankdir: opts.direction,
    ranksep: opts.rankSep,
    nodesep: opts.nodeSep,
  })

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    })
  })

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // Run layout
  dagre.layout(dagreGraph)

  // Get positioned nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - opts.nodeWidth / 2,
        y: nodeWithPosition.y - opts.nodeHeight / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}
