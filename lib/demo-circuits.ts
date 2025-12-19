/**
 * Copyright contributors to the Qiskit Studio project
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Node, Edge } from "reactflow"

// Define the type for a complete circuit
export interface CircuitDemo {
  id: string
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
}

// Chemistry simulation demo
const chemistrySimulation: CircuitDemo = {
  id: "chemistry-simulation",
  name: "Chemistry Simulation",
  description: "Quantum simulation of N2 molecule using SQD technique",
  nodes: [
    // STEP 1: Map (Column 1)
    {
      id: "chemistry-mapping",
      type: "chemistryNode",
      data: {
        label: "Chemistry",
        category: "Molecular System",
        details: "N2 molecule with CCSD amplitudes"
      },
      position: { x: 50, y: 50 },
    },
    {
      id: "ucj-circuit",
      type: "circuitLibraryNode",
      data: {
        label: "Circuit Library",
        category: "ffsim",
        details: "Hartree-Fock + UCJ ansatz + measurements"
      },
      position: { x: 50, y: 550 },
    },
    // STEP 2: Optimize (Column 2)
    {
      id: "transpiler",
      type: "transpilerNode",
      data: {
        label: "Transpiler",
        category: "Optimization",
        optimizationLevel: 3,
        layout: "sabre",
        routing: "sabre",
        translation: "translator",
        enableScheduling: false,
        details: "ffsim PRE_INIT passes + level 3 optimization"
      },
      position: { x: 400, y: 50 },
    },
    // STEP 3: Execute (Column 3)
    {
      id: "sampler",
      type: "runtimeNode",
      data: {
        label: "Runtime Primitives",
        category: "Sampler",
        resilience_level: 1,
        shots: 100000,
        details: "SamplerV2 with 100k shots"
      },
      position: { x: 750, y: 50 },
    },
    {
      id: "hardware-execution",
      type: "executionNode",
      data: {
        label: "Execution Modes",
        category: "Job",
        details: "Execute on IBM Quantum backend"
      },
      position: { x: 750, y: 350 },
    },
    // STEP 4: Post-process (Column 4)
    {
      id: "sqd-postprocess",
      type: "postProcessNode",
      data: {
        label: "Post Process Code",
        category: "Python",
        details: "Configuration recovery + fermion solver"
      },
      position: { x: 1100, y: 50 },
    },
    {
      id: "Output",
      type: "visualizationNode",
      data: {
        label: "Visualization Module",
        category: "Raw",
        details: "Energy comparison results",
        defaultText: "Exact energy: -1.16 H\nFinal SQD energy: -1.15 H\nError: 0.011 H"
      },
      position: { x: 1100, y: 350 },
    },
  ],
  edges: [
    // STEP 1: Mapping (vertical flow in left column)
    {
      id: "e-mapping-circuit",
      source: "chemistry-mapping",
      target: "ucj-circuit",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#D02771" },
      label: "Molecular data",
      labelStyle: { fill: "#D02771", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    // STEP 2: Optimize (vertical flow in left column)
    {
      id: "e-circuit-transpiler",
      source: "ucj-circuit",
      target: "transpiler",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#D02771" },
      label: "Circuit",
      labelStyle: { fill: "#D02771", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    // STEP 3: Execute (cross-column flows)  
    {
      id: "e-transpiler-sampler",
      source: "transpiler",
      target: "sampler",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#893FFC" },
      label: "Optimized",
      labelStyle: { fill: "#893FFC", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    {
      id: "e-sampler-execution",
      source: "sampler",
      target: "hardware-execution",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#0E62FE" },
      label: "Execute",
      labelStyle: { fill: "#0E62FE", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    // STEP 4: Post-process (vertical flow in right column)
    {
      id: "e-execution-postprocess",
      source: "hardware-execution",
      target: "sqd-postprocess",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#0E62FE" },
      label: "Results",
      labelStyle: { fill: "#0E62FE", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    {
      id: "e-postprocess-visualization",
      source: "sqd-postprocess",
      target: "Output",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#1A8038" },
      label: "Analysis",
      labelStyle: { fill: "#1A8038", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
  ],
}

// max-cut demo
const maxCut: CircuitDemo = {
  id: "max-cut",
  name: "MAX CUT",
  description: "Quantum algorithm for solving the MAX CUT graph partitioning problem",
  nodes: [
    // STEP 1: Map (Column 1)
    {
      id: "graph-to-hamiltonian",
      type: "pythonNode",
      data: {
        label: "Python Code",
        category: "Python",
        details: "Define graph structure and convert to cost Hamiltonian",
        inputCode: `graph.add_nodes_from(np.arange(0, n, 1))\nedge_list = [\n    (0, 1, 1.0),\n    (0, 2, 1.0),\n    (0, 4, 1.0),\n    (1, 2, 1.0),\n    (2, 3, 1.0),\n    (3, 4, 1.0),\n]\ngraph.add_edges_from(edge_list)`
      },
      position: { x: 50, y: 50 },
    },
    {
      id: "qaoa-circuit",
      type: "circuitLibraryNode",
      data: {
        label: "Circuit Library",
        category: "QAOAAnsatz",
        details: "2 reps, with measurements"
      },
      position: { x: 50, y: 400 },
    },
    // STEP 2: Optimize (Column 2)
    {
      id: "transpiler",
      type: "transpilerNode",
      data: {
        label: "Transpiler",
        category: "Optimization",
        optimizationLevel: 3,
        layout: "sabre",
        routing: "sabre",
        translation: "translator",
        enableScheduling: false,
        details: "Level 3 optimization"
      },
      position: { x: 400, y: 50 },
    },
    // STEP 3: Execute (Column 3)
    {
      id: "estimator-optimization",
      type: "runtimeNode",
      data: {
        label: "Runtime Primitives",
        category: "Estimator",
        resilience_level: 2,
        shots: 1000,
        details: "COBYLA optimization with cost function"
      },
      position: { x: 750, y: 50 },
    },
    {
      id: "estimator-session",
      type: "runtimeNode",
      data: {
        label: "Runtime Primitives",
        category: "Estimator",
        resilience_level: 1,
        shots: 1000,
        details: "Session with error mitigation"
      },
      position: { x: 750, y: 400 },
    },
    {
      id: "sampler",
      type: "runtimeNode",
      data: {
        label: "Runtime Primitives",
        category: "Sampler",
        resilience_level: 1,
        shots: 10000,
        details: "10k shots with optimized parameters"
      },
      position: { x: 750, y: 750 },
    },
    // STEP 4: Post-process (Column 4)
    {
      id: "Output",
      type: "visualizationNode",
      data: {
        label: "Visualization Module",
        category: "Graph",
        details: "Most likely cut solution analysis",
        defaultText: JSON.stringify({
          "nodes": 5,
          "edges": [[0, 1, 1.0], [0, 2, 1.0], [0, 4, 1.0], [1, 2, 1.0], [2, 3, 1.0], [3, 4, 1.0]],
          "bitstring": [0, 1, 0, 1, 1]
        })
      },
      position: { x: 1100, y: 50 },
    },
  ],
  edges: [
    // STEP 1: Mapping (vertical flow in left column)
    {
      id: "e-graph-qaoa",
      source: "graph-to-hamiltonian",
      target: "qaoa-circuit",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#D02771" },
      label: "Hamiltonian",
      labelStyle: { fill: "#D02771", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    // STEP 2: Optimize (vertical flow in left column)
    {
      id: "e-qaoa-transpiler",
      source: "qaoa-circuit",
      target: "transpiler",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#D02771" },
      label: "Circuit",
      labelStyle: { fill: "#D02771", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    // STEP 3: Execute (cross-column flows)
    {
      id: "e-transpiler-estimator1",
      source: "transpiler",
      target: "estimator-optimization",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#893FFC" },
      label: "Optimized",
      labelStyle: { fill: "#893FFC", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    {
      id: "e-estimator1-estimator2",
      source: "estimator-optimization",
      target: "estimator-session",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#0E62FE" },
      label: "Parameters",
      labelStyle: { fill: "#0E62FE", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    {
      id: "e-estimator2-sampler",
      source: "estimator-session",
      target: "sampler",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#0E62FE" },
      label: "Final circuit",
      labelStyle: { fill: "#0E62FE", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    // STEP 4: Post-process (vertical flow in right column)
    {
      id: "e-sampler-analysis",
      source: "sampler",
      target: "Output",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#0E62FE" },
      label: "Results",
      labelStyle: { fill: "#0E62FE", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
  ],
}

// CHSH inequality demo
const chshInequality: CircuitDemo = {
  id: "chsh-inequality",
  name: "CHSH Inequality",
  description: "Demonstrates the violation of CHSH inequality using entangled qubits",
  nodes: [
    // STEP 1: Map (Column 1)
    {
      id: "bell-state-circuit",
      type: "circuitLibraryNode",
      data: {
        label: "Circuit Library",
        category: "Entanglement",
        details: "H + CNOT + RY(θ) with 21 phases"
      },
      position: { x: 50, y: 50 },
    },
    {
      id: "chsh-observables",
      type: "quantumInfoNode",
      data: {
        label: "Quantum Info Library",
        category: "SparsePauliOp",
        details: "CHSH1 and CHSH2 operators"
      },
      position: { x: 50, y: 300 },
    },
    // STEP 2: Optimize (Column 2)
    {
      id: "transpiler",
      type: "transpilerNode",
      data: {
        label: "Transpiler",
        category: "Optimization",
        optimizationLevel: 3,
        layout: "sabre",
        routing: "sabre",
        translation: "translator",
        enableScheduling: false,
        details: "Level 3 optimization + layout mapping"
      },
      position: { x: 400, y: 50 },
    },
    // STEP 3: Execute (Column 3)
    {
      id: "estimator",
      type: "runtimeNode",
      data: {
        label: "Runtime Primitives",
        category: "Estimator",
        resilience_level: 1,
        details: "EstimatorV2 with ISA circuit and observables"
      },
      position: { x: 750, y: 50 },
    },
    {
      id: "execute-job",
      type: "executionNode",
      data: {
        label: "Execution Modes",
        category: "Job",
        details: "Run estimator with 21 phase values"
      },
      position: { x: 750, y: 450 },
    },
    // STEP 4: Post-process (Column 4)
    {
      id: "Output",
      type: "visualizationNode",
      data: {
        label: "Visualization Module",
        category: "Plot",
        details: "CHSH1 and CHSH2 expectation values",
        defaultText: "{'CHSH1': [2.01953125, 1.30224609375, 0.46044921875, -0.4658203125, -1.29443359375, -2.00146484375, -2.53271484375, -2.77783203125, -2.7802734375, -2.552734375, -2.01123046875, -1.3134765625, -0.4375, 0.4697265625, 1.30712890625, 1.943359375, 2.4951171875, 2.79541015625, 2.78369140625, 2.52978515625, 1.96826171875], 'CHSH2': [1.98046875, 2.48095703125, 2.81298828125, 2.7841796875, 2.53759765625, 1.99853515625, 1.25830078125, 0.45068359375, -0.4541015625, -1.2587890625, -1.98876953125, -2.5029296875, -2.8251953125, -2.7763671875, -2.50341796875, -2.056640625, -1.3125, -0.42138671875, 0.43408203125, 1.28076171875, 2.03173828125]}"
      },
      position: { x: 1100, y: 50 },
    },
  ],
  edges: [
    // STEP 1: Mapping (vertical flow in left column)
    {
      id: "e-bell-observables",
      source: "bell-state-circuit",
      target: "chsh-observables",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#D02771" },
      label: "Circuit",
      labelStyle: { fill: "#D02771", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    // STEP 2: Optimize (vertical flow in left column)
    {
      id: "e-observables-transpiler",
      source: "chsh-observables",
      target: "transpiler",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#D02771" },
      label: "Observables",
      labelStyle: { fill: "#D02771", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    // STEP 3: Execute (cross-column flows)
    {
      id: "e-transpiler-estimator",
      source: "transpiler",
      target: "estimator",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#893FFC" },
      label: "Optimized",
      labelStyle: { fill: "#893FFC", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    {
      id: "e-estimator-execute",
      source: "estimator",
      target: "execute-job",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#0E62FE" },
      label: "Execute",
      labelStyle: { fill: "#0E62FE", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
    // STEP 4: Post-process (vertical flow in right column)
    {
      id: "e-execute-raw",
      source: "execute-job",
      target: "Output",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#0E62FE" },
      label: "Results",
      labelStyle: { fill: "#0E62FE", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      labelBgPadding: [8, 4],
    },
  ],
};


// Export all demos
export const demoCircuits: CircuitDemo[] = [chemistrySimulation, maxCut, chshInequality];

// Export a function to get a demo by ID
export function getDemoById(id: string): CircuitDemo | undefined {
  return demoCircuits.find((demo) => demo.id === id)
}
