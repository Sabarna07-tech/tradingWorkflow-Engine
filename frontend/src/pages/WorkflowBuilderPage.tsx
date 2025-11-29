import React, { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { GraphCanvas } from "../components/workflow/GraphCanvas";
import { Inspector } from "../components/workflow/Inspector";
import { exampleWorkflow } from "../data/sampleWorkflow";
import type {
  Workflow,
  WorkflowEdge,
  WorkflowNode,
  Position,
  NodeKind,
} from "../types/workflow";

export const WorkflowBuilderPage: React.FC = () => {
  const [workflow, setWorkflow] = useState<Workflow>(exampleWorkflow);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    exampleWorkflow.nodes[0]?.id ?? null,
  );

  const handleNodePositionChange = (id: string, position: Position) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
    }));
  };

  const handleSelectNode = (id: string) => {
    setSelectedNodeId(id);
  };

  const handleChangeWorkflowName = (name: string) => {
    setWorkflow((prev) => ({ ...prev, name }));
  };

  const handleChangeNodeLabel = (id: string, label: string) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, label } : n)),
    }));
  };

  const handleChangeNextNode = (fromId: string, toId: string | null) => {
    setWorkflow((prev) => {
      const existingOutgoing = prev.edges.find((e) => e.from === fromId);
      const otherEdges = prev.edges.filter((e) => e.from !== fromId);

      if (!toId) {
        return { ...prev, edges: otherEdges };
      }

      const newEdge: WorkflowEdge = {
        id: existingOutgoing?.id ?? `edge-${prev.edges.length + 1}`,
        from: fromId,
        to: toId,
      };

      return {
        ...prev,
        edges: [...otherEdges, newEdge],
      };
    });
  };

  // ---------- Sidebar: add new nodes ----------
  const handleAddNode = (kind: NodeKind) => {
    setWorkflow((prev) => {
      const baseId =
        kind === "timer"
          ? "timer"
          : kind === "condition"
          ? "condition"
          : kind === "order"
          ? "order"
          : "log";

      const countOfKind = prev.nodes.filter((n) => n.kind === kind).length;
      const newId = `${baseId}-${countOfKind + 1}`;

      const defaultLabel =
        kind === "timer"
          ? "Every n minutes"
          : kind === "condition"
          ? "New condition"
          : kind === "order"
          ? "New order"
          : "New log";

      const newNode: WorkflowNode = {
        id: newId,
        kind,
        label: defaultLabel,
        position: {
          x: 200 + countOfKind * 40,
          y: 200 + countOfKind * 40,
        },
      };

      return {
        ...prev,
        nodes: [...prev.nodes, newNode],
      };
    });
  };

  // Simple placeholder handlers – later we’ll hook these to backend
  const handleValidate = () => {
    const issues: string[] = [];
    if (workflow.nodes.length === 0) {
      issues.push("Workflow has no nodes.");
    }
    for (const node of workflow.nodes) {
      const hasOutgoing = workflow.edges.some((e) => e.from === node.id);
      if (!hasOutgoing && node.kind !== "output") {
        issues.push(`Node ${node.id} (${node.label}) has no next node.`);
      }
    }

    if (issues.length === 0) {
      alert("Workflow looks valid ✅");
    } else {
      alert("Validation issues:\n\n" + issues.join("\n"));
    }
  };

  const handleRunOnce = () => {
    alert(
      "Run Once clicked.\n\nLater we’ll call the backend executor here to simulate a single run.",
    );
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/workflows/${workflow.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workflow),
        },
      );

      if (!response.ok) {
        throw new Error(`Save failed with status ${response.status}`);
      }

      alert("Workflow saved to backend ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to save workflow. Check console for details.");
    }
  };

  return (
    <div className="page">
      <Sidebar onAddNode={handleAddNode} />

      <main className="canvas">
        <div className="canvas-header">
          <div>
            <div className="canvas-title">{workflow.name}</div>
            <div className="canvas-subtitle">
              Build a graph that decides when and how to trade.
            </div>
          </div>
          <div className="canvas-actions">
            <button
              className="topbar-btn topbar-btn-secondary"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="topbar-btn topbar-btn-secondary"
              onClick={handleValidate}
            >
              Validate
            </button>
            <button
              className="topbar-btn topbar-btn-primary"
              onClick={handleRunOnce}
            >
              Run Once
            </button>
          </div>
        </div>

        <div className="canvas-body">
          <GraphCanvas
            workflow={workflow}
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
            onNodePositionChange={handleNodePositionChange}
          />
        </div>
      </main>

      <Inspector
        workflow={workflow}
        selectedNodeId={selectedNodeId}
        onChangeWorkflowName={handleChangeWorkflowName}
        onChangeNodeLabel={handleChangeNodeLabel}
        onChangeNextNode={handleChangeNextNode}
      />
    </div>
  );
};
