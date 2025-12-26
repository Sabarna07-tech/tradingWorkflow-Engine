"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflows = void 0;
const solDca5m = {
    id: "sol-dca-5m",
    name: "SOL DCA every 5 minutes",
    description: "Simple workflow that buys a fixed amount of SOL every 5 minutes on a paper exchange.",
    nodes: [
        {
            id: "timer-1",
            kind: "timer",
            label: "Every 5 minutes",
            x: 220,
            y: 260,
            data: { interval: "5", unit: "m" },
        },
        {
            id: "condition-1",
            kind: "condition",
            label: "If market open",
            x: 520,
            y: 260,
            data: { expression: "market_is_open" },
        },
        {
            id: "order-1",
            kind: "order",
            label: "Buy $10 SOL",
            x: 820,
            y: 260,
            data: { asset: "SOL", action: "buy", amount: 10 },
        },
        {
            id: "log-1",
            kind: "output",
            label: "Log fill",
            x: 1120,
            y: 260,
            data: { message: "Order filled" },
        },
    ],
    edges: [
        { id: "edge-1", from: "timer-1", to: "condition-1" },
        { id: "edge-2", from: "condition-1", to: "order-1" },
        { id: "edge-3", from: "order-1", to: "log-1" },
    ],
};
exports.workflows = {
    [solDca5m.id]: solDca5m,
};
