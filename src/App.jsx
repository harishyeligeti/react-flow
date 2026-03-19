import React, { useState, useCallback, useRef } from "react";
import { ReactFlow, addEdge, Background, Controls, applyEdgeChanges, applyNodeChanges, ReactFlowProvider,Panel } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import Sidebar from "./components/Sidebar";
import LogicNode from "./components/LogicNode";

const nodeTypes = { logicNode: LogicNode };

const App = () => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [rfInstance, setRfInstance] = useState(null);

    const onNodesChange = useCallback((chgs) => setNodes((nds) => applyNodeChanges(chgs, nds)), []);
    const onEdgesChange = useCallback((chgs) => setEdges((eds) => applyEdgeChanges(chgs, eds)), []);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const deleteNode = useCallback((id) => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        // Optional: Also remove edges connected to this node
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    }, []);

    const onLabelChange = useCallback((id, newLabel) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, label: newLabel } };
                }
                return node;
            })
        );
    }, []);
    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const data = JSON.parse(event.dataTransfer.getData("application/reactflow"));
            if (!data) return;

            const position = rfInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: `${data.type}-${Date.now()}`,
                type: "logicNode",
                position,
                data: {
                    ...data,
                    label: `new ${data.type}`,
                    onDelete: deleteNode, // Pass the delete function
                    onChange: onLabelChange, // Pass the change function
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [rfInstance, deleteNode, onLabelChange] // Add dependencies
    );

    const onExport = useCallback(() => {
      if (rfInstance) {
        const flow = rfInstance.toObject();
        const dataStr = JSON.stringify(flow, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `react-logic-${Date.now()}.json`);
        linkElement.click();
        linkElement.remove();
      }
    }, [rfInstance]);
    
    // --- IMPORT LOGIC ---
    const onImport = useCallback((event) => {
      const file = event.target.files[0];
      if (!file) return;
    
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target.result);
          
          if (flow) {
            // RE-HYDRATION: Put the functions back into the nodes
            const restoredNodes = flow.nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                onDelete: deleteNode,    // The function we defined in App.jsx
                onChange: onLabelChange, // The function we defined in App.jsx
              },
            }));
    
            setNodes(restoredNodes || []);
            setEdges(flow.edges || []);
            
            // Optional: Snap the view to the loaded nodes
            setTimeout(() => rfInstance?.fitView(), 100);
          }
        } catch (err) {
          console.error("Invalid JSON file", err);
          alert("Failed to parse the logic file.");
        }
      };
      reader.readAsText(file);
    }, [rfInstance, deleteNode, onLabelChange, setNodes, setEdges]);

    return (
        <div className="flex w-full h-screen">
            <Sidebar />
            <div className="flex-1 h-full" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setRfInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background variant="dots" gap={20} />
                    <Controls />
                    <Panel position="top-right" className="flex gap-2 bg-white p-2 rounded shadow-md border border-gray-200">
                        {/* Export Button */}
                        <button onClick={onExport} className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700 transition-colors">
                            EXPORT JSON
                        </button>

                        {/* Import Button (Triggers the hidden input) */}
                        <label className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded cursor-pointer hover:bg-black transition-colors">
                            IMPORT JSON
                            <input type="file" accept=".json" onChange={onImport} className="hidden" />
                        </label>

                        {/* Reset Button */}
                        <button
                            onClick={() => {
                                if (confirm("Clear canvas?")) {
                                    setNodes([]);
                                    setEdges([]);
                                }
                            }}
                            className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 transition-colors"
                        >
                            CLEAR
                        </button>
                    </Panel>
                </ReactFlow>
            </div>
        </div>
    );
};

export default () => (
    <ReactFlowProvider>
        <App />
    </ReactFlowProvider>
);
