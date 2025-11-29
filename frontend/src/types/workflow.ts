// frontend/src/types/workflow.ts

export type NodeKind = "timer" | "condition" | "order" | "output";

export interface Position {
  x: number;
  y: number;
}

export interface WorkflowNode {
  id: string;
  kind: NodeKind;
  label: string;
  position: Position;
}

export interface WorkflowEdge {
  id: string;
  from: string; // node id
  to: string; // node id
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
