// frontend/src/types/workflow.ts

export type NodeKind = "timer" | "condition" | "order" | "output";

export interface Position {
  x: number;
  y: number;
}

export interface TimerNodeData {
  interval: string; // e.g. "5"
  unit: "m" | "h";
}

export interface ConditionNodeData {
  expression: string; // e.g. "price > 100"
}

export interface OrderNodeData {
  asset: string; // e.g. "SOL"
  action: "buy" | "sell";
  amount: number;
}

export interface OutputNodeData {
  message: string;
}

export type NodeData =
  | TimerNodeData
  | ConditionNodeData
  | OrderNodeData
  | OutputNodeData
  | {};

export interface WorkflowNode {
  id: string;
  kind: NodeKind;
  label: string;
  x: number;
  y: number;
  data?: NodeData;
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
