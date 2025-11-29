import React from "react";
import type { Workflow, WorkflowNode } from "../../types/workflow";

interface InspectorProps {
  workflow: Workflow;
  selectedNodeId: string | null;
  onChangeWorkflowName: (name: string) => void;
  onChangeNodeLabel: (id: string, label: string) => void;
  onChangeNextNode: (fromId: string, toId: string | null) => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  workflow,
  selectedNodeId,
  onChangeWorkflowName,
  onChangeNodeLabel,
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
