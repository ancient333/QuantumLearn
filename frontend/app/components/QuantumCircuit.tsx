"use client";

import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

type QuantumCircuitProps = {
  gate: string;
};

export default function QuantumCircuit({ gate }: QuantumCircuitProps) {
 const nodes: Node[] =
  gate === "CNOT"
    ? [
        {
          id: "q0",
          position: { x: 50, y: 70 },
          data: {
            label: "q₀ ─── ●",
          },
          style: {
            background: "#1e293b",
            color: "white",
            border: "1px solid #475569",
            width: 220,
            padding: 15,
          },
        },
        {
          id: "q1",
          position: { x: 50, y: 180 },
          data: {
            label: "q₁ ─── ⊕",
          },
          style: {
            background: "#1e293b",
            color: "white",
            border: "1px solid #475569",
            width: 220,
            padding: 15,
          },
        },
      ]
    : [
        {
          id: "q0",
          position: { x: 50, y: 100 },
          data: {
            label: `q₀ ─── ${gate} ───`,
          },
          style: {
            background: "#1e293b",
            color: "white",
            border: "1px solid #475569",
            width: 220,
            padding: 15,
          },
        },
      ];

const edges: Edge[] =
  gate === "CNOT"
    ? [
        {
          id: "cnot-edge",
          source: "q0",
          target: "q1",
        },
      ]
    : [];

  return (
    <div className="h-[300px] w-full rounded-xl border border-slate-700 bg-slate-900">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}


