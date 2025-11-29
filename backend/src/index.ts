// backend/src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import { workflows } from "./data";
import { Workflow } from "./types";

const app = express();

app.use(cors());
app.use(express.json());

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
app.put("/workflows/:id", (req: Request, res: Response) => {
  const body = req.body as Workflow;

  if (!body || !body.id || !Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
    return res.status(400).json({ error: "Invalid workflow payload" });
  }

  workflows[req.params.id] = body;
  res.json({ ok: true });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
