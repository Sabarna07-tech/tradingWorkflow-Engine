// frontend/src/components/layout/Sidebar.tsx
import React from "react";
import type { NodeKind } from "../../types/workflow";

interface SidebarProps {
  onAddNode: (kind: NodeKind) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Blocks</div>
        <div className="sidebar-caption">Click to add a block to the canvas.</div>
      </div>
      <div className="sidebar-section">
        <button
          className="sidebar-block sidebar-block-timer"
          onClick={() => onAddNode("timer")}
        >
          <div className="sidebar-block-title">Timer</div>
          <div className="sidebar-block-caption">Run every n minutes</div>
        </button>
        <button
          className="sidebar-block sidebar-block-condition"
          onClick={() => onAddNode("condition")}
        >
          <div className="sidebar-block-title">If / Condition</div>
          <div className="sidebar-block-caption">Branch based on rules</div>
        </button>
        <button
          className="sidebar-block sidebar-block-order"
          onClick={() => onAddNode("order")}
        >
          <div className="sidebar-block-title">Place Order</div>
          <div className="sidebar-block-caption">Buy / sell on an exchange</div>
        </button>
        <button
          className="sidebar-block sidebar-block-output"
          onClick={() => onAddNode("output")}
        >
          <div className="sidebar-block-title">Output / Log</div>
          <div className="sidebar-block-caption">Log or send to webhook</div>
        </button>
      </div>
    </aside>
  );
};
