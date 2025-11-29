import { Workflow } from "./types";

export const workflows: Record<string, Workflow> = {
  "sol-dca-5m": {
    id: "sol-dca-5m",
    name: "SOL DCA every 5 minutes",
    description:
      "Simple workflow that buys a fixed amount of SOL every 5 minutes on a paper exchange.",
    nodes: [
      {
        id: "timer-1",
        kind: "timer",
        label: "Every 5 minutes",
        position: { x: 260, y: 260 },
      },
      {
        id: "condition-1",
        kind: "condition",
        label: "If market open",
        position: { x: 560, y: 260 },
      },
      {
        id: "order-1",
        kind: "order",
        label: "Buy $10 SOL",
        position: { x: 860, y: 260 },
      },
      {
        id: "log-1",
        kind: "output",
        label: "Log fill",
        position: { x: 1160, y: 260 },
      },
    ],
    edges: [
      { id: "edge-1", from: "timer-1", to: "condition-1" },
      { id: "edge-2", from: "condition-1", to: "order-1" },
      { id: "edge-3", from: "order-1", to: "log-1" },
    ],
  },
};
