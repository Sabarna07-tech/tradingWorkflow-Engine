export type WorkflowNodeKind = "timer" | "condition" | "order" | "output";

export interface TimerNodeData {
  interval: string;
  unit: "m" | "h";
}

export interface ConditionNodeData {
  expression: string;
}

export interface OrderNodeData {
  asset: string;
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
  kind: WorkflowNodeKind;
  label: string;
  x: number;
  y: number;
  data?: NodeData;
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
