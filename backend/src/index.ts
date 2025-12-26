// backend/src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { Workflow } from "./types";
import { loadWorkflows, saveWorkflows } from "./store";

const app = express();

app.use(cors());
app.use(express.json());

// In-memory cache of workflows
let workflows: Record<string, Workflow> = {};

// Initialize data
(async () => {
  workflows = await loadWorkflows();
  console.log(`Loaded ${Object.keys(workflows).length} workflows.`);
})();

// simple health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// list all workflows
app.get("/workflows", (_req: Request, res: Response) => {
  res.json(Object.values(workflows));
});

// get one workflow
app.get("/workflows/:id", (req: Request, res: Response) => {
  const wf = workflows[req.params.id];
  if (!wf) {
    return res.status(404).json({ error: "Workflow not found" });
  }
  res.json(wf);
});

// save/update workflow
app.put("/workflows/:id", async (req: Request, res: Response) => {
  const body = req.body as Workflow;

  if (!body || !body.id || !Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
    return res.status(400).json({ error: "Invalid workflow payload" });
  }

  workflows[req.params.id] = body;
  await saveWorkflows(workflows); // Persist to disk
  res.json({ ok: true });
});

// execute a workflow once (simple linear walk using outgoing edges)
app.post("/workflows/:id/execute", (req: Request, res: Response) => {
  const wf = workflows[req.params.id];
  if (!wf) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  const outgoing = new Map<string, string>();
  const incomingCount = new Map<string, number>();

  for (const node of wf.nodes) {
    incomingCount.set(node.id, 0);
  }

  for (const edge of wf.edges) {
    outgoing.set(edge.from, edge.to);
    incomingCount.set(edge.to, (incomingCount.get(edge.to) ?? 0) + 1);
  }

  let startNode =
    wf.nodes.find((n) => n.kind === "timer") ??
    wf.nodes.find((n) => (incomingCount.get(n.id) ?? 0) === 0);

  if (!startNode) {
    return res.status(400).json({ error: "Cannot find a start node" });
  }

  const visited = new Set<string>();
  const steps: { id: string; kind: string; label: string }[] = [];

  let current = startNode;
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    steps.push({
      id: current.id,
      kind: current.kind,
      label: current.label,
    });

    const nextId = outgoing.get(current.id);
    if (!nextId) break;

    const nextNode = wf.nodes.find((n) => n.id === nextId);
    if (!nextNode) break;

    current = nextNode;
  }

  res.json({
    workflowId: wf.id,
    steps,
  });
});

// Serve frontend static files
const frontendDist = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendDist));

// Catch-all handler for React routing
app.get(/.*/, (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
