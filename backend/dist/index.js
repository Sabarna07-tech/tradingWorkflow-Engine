"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const store_1 = require("./store");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// In-memory cache of workflows
let workflows = {};
// Initialize data
(async () => {
    workflows = await (0, store_1.loadWorkflows)();
    console.log(`Loaded ${Object.keys(workflows).length} workflows.`);
})();
// simple health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
// list all workflows
app.get("/workflows", (_req, res) => {
    res.json(Object.values(workflows));
});
// get one workflow
app.get("/workflows/:id", (req, res) => {
    const wf = workflows[req.params.id];
    if (!wf) {
        return res.status(404).json({ error: "Workflow not found" });
    }
    res.json(wf);
});
// save/update workflow
app.put("/workflows/:id", async (req, res) => {
    const body = req.body;
    if (!body || !body.id || !Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
        return res.status(400).json({ error: "Invalid workflow payload" });
    }
    workflows[req.params.id] = body;
    await (0, store_1.saveWorkflows)(workflows); // Persist to disk
    res.json({ ok: true });
});
// execute a workflow once (simple linear walk using outgoing edges)
app.post("/workflows/:id/execute", (req, res) => {
    const wf = workflows[req.params.id];
    if (!wf) {
        return res.status(404).json({ error: "Workflow not found" });
    }
    const outgoing = new Map();
    const incomingCount = new Map();
    for (const node of wf.nodes) {
        incomingCount.set(node.id, 0);
    }
    for (const edge of wf.edges) {
        outgoing.set(edge.from, edge.to);
        incomingCount.set(edge.to, (incomingCount.get(edge.to) ?? 0) + 1);
    }
    let startNode = wf.nodes.find((n) => n.kind === "timer") ??
        wf.nodes.find((n) => (incomingCount.get(n.id) ?? 0) === 0);
    if (!startNode) {
        return res.status(400).json({ error: "Cannot find a start node" });
    }
    const visited = new Set();
    const steps = [];
    let current = startNode;
    while (current && !visited.has(current.id)) {
        visited.add(current.id);
        steps.push({
            id: current.id,
            kind: current.kind,
            label: current.label,
        });
        const nextId = outgoing.get(current.id);
        if (!nextId)
            break;
        const nextNode = wf.nodes.find((n) => n.id === nextId);
        if (!nextNode)
            break;
        current = nextNode;
    }
    res.json({
        workflowId: wf.id,
        steps,
    });
});
// Serve frontend static files
const frontendDist = path_1.default.join(__dirname, "../../frontend/dist");
app.use(express_1.default.static(frontendDist));
// Catch-all handler for React routing
app.get(/.*/, (_req, res) => {
    res.sendFile(path_1.default.join(frontendDist, "index.html"));
});
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
});
