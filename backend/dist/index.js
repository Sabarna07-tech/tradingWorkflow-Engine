"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const data_1 = require("./data");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// simple health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
// list all workflows
app.get("/workflows", (_req, res) => {
    res.json(Object.values(data_1.workflows));
});
// get one workflow
app.get("/workflows/:id", (req, res) => {
    const wf = data_1.workflows[req.params.id];
    if (!wf) {
        return res.status(404).json({ error: "Workflow not found" });
    }
    res.json(wf);
});
// save/update workflow
app.put("/workflows/:id", (req, res) => {
    const body = req.body;
    if (!body || !body.id || !Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
        return res.status(400).json({ error: "Invalid workflow payload" });
    }
    data_1.workflows[req.params.id] = body;
    res.json({ ok: true });
});
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
});
