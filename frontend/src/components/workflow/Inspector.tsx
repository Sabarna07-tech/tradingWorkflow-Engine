import React from "react";
import type { Workflow, WorkflowNode } from "../../types/workflow";

interface InspectorProps {
  workflow: Workflow;
  selectedNodeId: string | null;
  onChangeWorkflowName: (name: string) => void;
  onChangeNodeLabel: (id: string, label: string) => void;
  onChangeNodeData: (id: string, data: any) => void;
  onChangeNextNode: (fromId: string, toId: string | null) => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  workflow,
  selectedNodeId,
  onChangeWorkflowName,
  onChangeNodeLabel,
  onChangeNodeData,
  onChangeNextNode,
}) => {
  const selectedNode: WorkflowNode | undefined = workflow.nodes.find(
    (n) => n.id === selectedNodeId,
  );

  const outgoingEdge = selectedNode
    ? workflow.edges.find((e) => e.from === selectedNode.id)
    : undefined;

  const handleWorkflowNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onChangeWorkflowName(e.target.value);
  };

  const handleNodeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedNode) return;
    onChangeNodeLabel(selectedNode.id, e.target.value);
  };

  const handleNextNodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedNode) return;
    const value = e.target.value;
    onChangeNextNode(selectedNode.id, value === "" ? null : value);
  };



  return (
    <aside className="inspector">
      <div className="inspector-header">
        <div className="inspector-title">Inspector</div>
        <div className="inspector-caption">
          Select a node to edit its parameters.
        </div>
      </div>

      <div className="inspector-body">
        <div className="inspector-section">
          <div className="inspector-section-title">Workflow Settings</div>
          <label className="inspector-field">
            <span className="inspector-label">Name</span>
            <input
              className="inspector-input"
              value={workflow.name}
              onChange={handleWorkflowNameChange}
              placeholder="Untitled workflow"
            />
          </label>
        </div>

        {selectedNode && (
          <div className="inspector-section">
            <div className="inspector-section-title">Selected Node</div>
            <div className="inspector-field">
              <span className="inspector-label">Node ID</span>
              <div className="inspector-value">{selectedNode.id}</div>
            </div>
            <label className="inspector-field">
              <span className="inspector-label">Label</span>
              <input
                className="inspector-input"
                value={selectedNode.label}
                onChange={handleNodeLabelChange}
              />
            </label>
            <div className="inspector-field">
              <span className="inspector-label">Type</span>
              <div className="inspector-value">
                {selectedNode.kind.toUpperCase()}
              </div>
            </div>

            {/* Specific Data Fields */}
            {selectedNode.kind === "timer" && (
              <>
                <label className="inspector-field">
                  <span className="inspector-label">Interval</span>
                  <input
                    className="inspector-input"
                    value={(selectedNode.data as any)?.interval || ""}
                    onChange={(e) => onChangeNodeData(selectedNode.id, { ...selectedNode.data, interval: e.target.value })}
                  />
                </label>
                <label className="inspector-field">
                  <span className="inspector-label">Unit</span>
                  <select
                    className="inspector-input"
                    value={(selectedNode.data as any)?.unit || "m"}
                    onChange={(e) => onChangeNodeData(selectedNode.id, { ...selectedNode.data, unit: e.target.value })}
                  >
                    <option value="m">Minutes</option>
                    <option value="h">Hours</option>
                  </select>
                </label>
              </>
            )}

            {selectedNode.kind === "condition" && (
              <label className="inspector-field">
                <span className="inspector-label">Expression</span>
                <input
                  className="inspector-input"
                  value={(selectedNode.data as any)?.expression || ""}
                  onChange={(e) => onChangeNodeData(selectedNode.id, { ...selectedNode.data, expression: e.target.value })}
                />
              </label>
            )}

            {selectedNode.kind === "order" && (
              <>
                <label className="inspector-field">
                  <span className="inspector-label">Asset</span>
                  <input
                    className="inspector-input"
                    value={(selectedNode.data as any)?.asset || ""}
                    onChange={(e) => onChangeNodeData(selectedNode.id, { ...selectedNode.data, asset: e.target.value })}
                  />
                </label>
                <label className="inspector-field">
                  <span className="inspector-label">Action</span>
                  <select
                    className="inspector-input"
                    value={(selectedNode.data as any)?.action || "buy"}
                    onChange={(e) => onChangeNodeData(selectedNode.id, { ...selectedNode.data, action: e.target.value })}
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </label>
                <label className="inspector-field">
                  <span className="inspector-label">Amount</span>
                  <input
                    type="number"
                    className="inspector-input"
                    value={(selectedNode.data as any)?.amount || 0}
                    onChange={(e) => onChangeNodeData(selectedNode.id, { ...selectedNode.data, amount: Number(e.target.value) })}
                  />
                </label>
              </>
            )}

            {selectedNode.kind === "output" && (
              <label className="inspector-field">
                <span className="inspector-label">Message</span>
                <input
                  className="inspector-input"
                  value={(selectedNode.data as any)?.message || ""}
                  onChange={(e) => onChangeNodeData(selectedNode.id, { ...selectedNode.data, message: e.target.value })}
                />
              </label>
            )}

            <label className="inspector-field">
              <span className="inspector-label">Next Node</span>
              <select
                className="inspector-input"
                value={outgoingEdge?.to ?? ""}
                onChange={handleNextNodeChange}
              >
                <option value="">(None)</option>
                {workflow.nodes
                  .filter((n) => n.id !== selectedNode.id)
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label} ({n.id})
                    </option>
                  ))}
              </select>
            </label>
          </div>
        )}
      </div>
    </aside>
  );
};
