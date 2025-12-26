import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { GraphCanvas } from "../components/workflow/GraphCanvas";
import { Inspector } from "../components/workflow/Inspector";
import { exampleWorkflow } from "../data/sampleWorkflow";
import type { Workflow, WorkflowEdge, WorkflowNode, Position, NodeKind } from "../types/workflow";

export const WorkflowBuilderPage: React.FC = () => {
  const [workflow, setWorkflow] = useState<Workflow>(exampleWorkflow);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    exampleWorkflow.nodes[0]?.id ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ---- Load workflow from backend on mount ----
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("http://localhost:4000/workflows/sol-dca-5m");
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = (await res.json()) as Workflow;
        setWorkflow(data);
        setSelectedNodeId(data.nodes[0]?.id ?? null);
      } catch (err) {
        console.error("Failed to load workflow, falling back to example", err);
        setLoadError("Could not load from backend, using local example.");
        setWorkflow(exampleWorkflow);
        setSelectedNodeId(exampleWorkflow.nodes[0]?.id ?? null);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  // keep selection valid when nodes change
  useEffect(() => {
    if (selectedNodeId && !workflow.nodes.find((n) => n.id === selectedNodeId)) {
      setSelectedNodeId(workflow.nodes[0]?.id ?? null);
    }
  }, [workflow.nodes, selectedNodeId]);

  const handleNodePositionChange = (id: string, position: Position) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === id ? { ...n, x: position.x, y: position.y } : n,
      ),
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

  const handleChangeNodeData = (id: string, data: any) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, data } : n)),
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

  // Sidebar: add new nodes
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

      let defaultData = {};
      if (kind === "timer") {
        defaultData = { interval: "5", unit: "m" };
      } else if (kind === "condition") {
        defaultData = { expression: "price > 0" };
      } else if (kind === "order") {
        defaultData = { asset: "SOL", action: "buy", amount: 1 };
      } else if (kind === "output") {
        defaultData = { message: "Log message" };
      }

      const newNode: WorkflowNode = {
        id: newId,
        kind,
        label: defaultLabel,
        x: 200 + countOfKind * 40,
        y: 200 + countOfKind * 40,
        data: defaultData,
      };

      return {
        ...prev,
        nodes: [...prev.nodes, newNode],
      };
    });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/workflows/${workflow.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workflow),
        },
      );

      if (!res.ok) {
        throw new Error(`Save failed with status ${res.status}`);
      }

      alert("Workflow saved to backend ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to save workflow. Check console for details.");
    }
  };

  const handleValidate = () => {
    const hasTimer = workflow.nodes.some((n) => n.kind === "timer");
    const hasOutput = workflow.nodes.some((n) => n.kind === "output");

    if (!hasTimer || !hasOutput) {
      alert("Validation failed: need at least one TIMER and one OUTPUT.");
      return;
    }

    alert("Workflow looks valid ✅ (basic checks only).");
  };

  const handleRunOnce = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/workflows/${workflow.id}/execute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!res.ok) {
        throw new Error(`Execute failed with status ${res.status}`);
      }

      const data = await res.json();
      const steps = (data.steps ?? []) as {
        id: string;
        kind: string;
        label: string;
      }[];

      const summary =
        steps.length === 0
          ? "No steps executed."
          : steps
            .map(
              (s, idx) =>
                `${idx + 1}. [${s.kind.toUpperCase()}] ${s.label} (${s.id})`,
            )
            .join("\n");

      alert("Execution path:\n\n" + summary);
      console.log("Execution result:", data);
    } catch (err) {
      console.error(err);
      alert("Failed to execute workflow. Check console for details.");
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
              {workflow.description ??
                "Build a graph that decides when and how to trade."}
            </div>
            {isLoading && <div className="canvas-status">Loading…</div>}
            {loadError && (
              <div className="canvas-status canvas-status-error">
                {loadError}
              </div>
            )}
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
        onChangeNodeData={handleChangeNodeData}
        onChangeNextNode={handleChangeNextNode}
      />
    </div>
  );
};
