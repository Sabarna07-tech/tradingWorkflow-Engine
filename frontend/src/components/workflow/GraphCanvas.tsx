// frontend/src/components/workflow/GraphCanvas.tsx
import type React from "react";
import { useMemo, useRef, useState } from "react";
import type { Workflow, WorkflowNode, Position } from "../../types/workflow";

interface GraphCanvasProps {
  workflow: Workflow;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onNodePositionChange: (id: string, position: Position) => void;
}

const NODE_WIDTH = 260;
const NODE_HEIGHT = 120;

export const GraphCanvas = ({
  workflow,
  selectedNodeId,
  onSelectNode,
  onNodePositionChange,
}: GraphCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const dragInfoRef = useRef<{
    nodeId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // --- view transform (zoom + pan) ---
  const [view, setView] = useState({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originOffsetX: number;
    originOffsetY: number;
  } | null>(null);

  const nodeById = useMemo(() => {
    const map: Record<string, WorkflowNode> = {};
    for (const n of workflow.nodes) map[n.id] = n;
    return map;
  }, [workflow.nodes]);

  // ---------- NODE DRAGGING ----------
  const handleNodePointerDown = (
    node: WorkflowNode,
    e: React.PointerEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation(); // prevent starting pan

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // convert pointer position into canvas coord space
    const pointerXInCanvas = (e.clientX - rect.left - view.offsetX) / view.scale;
    const pointerYInCanvas = (e.clientY - rect.top - view.offsetY) / view.scale;

    dragInfoRef.current = {
      nodeId: node.id,
      offsetX: pointerXInCanvas - node.x,
      offsetY: pointerYInCanvas - node.y,
    };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onSelectNode(node.id);
  };

  const handleNodePointerMove = (
    e: React.PointerEvent<HTMLButtonElement>,
  ) => {
    if (!dragInfoRef.current || !canvasRef.current) return;

    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();

    const pointerXInCanvas = (e.clientX - rect.left - view.offsetX) / view.scale;
    const pointerYInCanvas = (e.clientY - rect.top - view.offsetY) / view.scale;

    const { nodeId, offsetX, offsetY } = dragInfoRef.current;

    const nextX = pointerXInCanvas - offsetX;
    const nextY = pointerYInCanvas - offsetY;

    onNodePositionChange(nodeId, {
      x: nextX,
      y: nextY,
    });
  };

  const handleNodePointerUp = (
    e: React.PointerEvent<HTMLButtonElement>,
  ) => {
    if (!dragInfoRef.current) return;
    dragInfoRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // ---------- CANVAS PAN ----------
  const handleCanvasPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
  ) => {
    // only start panning if we clicked empty background, not a node
    if (e.target !== canvasRef.current) return;

    e.preventDefault();

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    panRef.current = {
      pointerId: e.pointerId,
      startX: x,
      startY: y,
      originOffsetX: view.offsetX,
      originOffsetY: view.offsetY,
    };

    canvasRef.current!.setPointerCapture(e.pointerId);
  };

  const handleCanvasPointerMove = (
    e: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!panRef.current) return;
    e.preventDefault();

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { startX, startY, originOffsetX, originOffsetY } = panRef.current;

    setView((prev) => ({
      ...prev,
      offsetX: originOffsetX + (x - startX),
      offsetY: originOffsetY + (y - startY),
    }));
  };

  const handleCanvasPointerUp = (
    e: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!panRef.current) return;
    if (e.pointerId === panRef.current.pointerId) {
      panRef.current = null;
      canvasRef.current?.releasePointerCapture(e.pointerId);
    }
  };

  // ---------- CANVAS ZOOM ----------
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const zoomIntensity = 0.0015;
    const delta = -e.deltaY * zoomIntensity;

    setView((prev) => {
      let scale = prev.scale * (1 + delta);
      scale = Math.max(0.4, Math.min(1.8, scale)); // clamp zoom

      // keep the point under cursor fixed while zooming
      const worldX = (x - prev.offsetX) / prev.scale;
      const worldY = (y - prev.offsetY) / prev.scale;

      const offsetX = x - worldX * scale;
      const offsetY = y - worldY * scale;

      return { scale, offsetX, offsetY };
    });
  };

  return (
    <div
      className="graph-canvas"
      ref={canvasRef}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onWheel={handleWheel}
    >
      <div
        className="graph-content"
        style={{
          transform: `translate(${view.offsetX}px, ${view.offsetY}px) scale(${view.scale})`,
          transformOrigin: "0 0",
        }}
      >
        <div className="graph-grid" />

        {/* Edges */}
        <svg className="graph-edges" width="100%" height="100%">
          {workflow.edges.map((edge) => {
            const from = nodeById[edge.from];
            const to = nodeById[edge.to];
            if (!from || !to) return null;

            const fromX = from.x + NODE_WIDTH;
            const fromY = from.y + NODE_HEIGHT / 2;
            const toX = to.x;
            const toY = to.y + NODE_HEIGHT / 2;

            const cp1x = fromX + 40;
            const cp1y = fromY;
            const cp2x = toX - 40;
            const cp2y = toY;

            const d = `M ${fromX} ${fromY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${toX} ${toY}`;

            return <path key={edge.id} d={d} className="graph-edge" />;
          })}
        </svg>

        {/* Nodes */}
        {workflow.nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          return (
            <button
              key={node.id}
              type="button"
              className={[
                "graph-node",
                `graph-node--${node.kind}`,
                isSelected ? "graph-node--selected" : "",
              ].join(" ")}
              style={{
                left: node.x,
                top: node.y,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
              }}
              onPointerDown={(e) => handleNodePointerDown(node, e)}
              onPointerMove={handleNodePointerMove}
              onPointerUp={handleNodePointerUp}
            >
              <div className="graph-node-kind">
                {node.kind === "timer"
                  ? "TIMER"
                  : node.kind === "condition"
                    ? "CONDITION"
                    : node.kind === "order"
                      ? "ORDER"
                      : "OUTPUT"}
              </div>
              <div className="graph-node-label">{node.label}</div>

              {/* Specific Node Details */}
              <div className="graph-node-details" style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px" }}>
                {node.kind === "timer" && node.data && (
                  <div>Interval: {(node.data as any).interval}{(node.data as any).unit}</div>
                )}
                {node.kind === "condition" && node.data && (
                  <div>Expr: {(node.data as any).expression}</div>
                )}
                {node.kind === "order" && node.data && (
                  <div>{(node.data as any).action?.toUpperCase()} {(node.data as any).amount} {(node.data as any).asset}</div>
                )}
                {node.kind === "output" && node.data && (
                  <div>Msg: {(node.data as any).message}</div>
                )}
              </div>

              <div className="graph-node-id">{node.id}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
