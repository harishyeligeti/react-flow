import React from 'react';
import { BLOCK_TYPES } from '../constants';

export default function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 border-r bg-white p-4 flex flex-col gap-3">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">Logic Blocks</h2>
        <p className="text-xs text-gray-500">Drag items to the canvas</p>
      </div>

      {BLOCK_TYPES.map((block) => (
        <div
          key={block.type}
          className={`cursor-grab p-3 rounded-md border-2 bg-white font-semibold transition-transform hover:scale-105 ${block.color} ${block.text}`}
          onDragStart={(event) => onDragStart(event, block)}
          draggable
        >
          {block.type}
        </div>
      ))}
    </aside>
  );
}