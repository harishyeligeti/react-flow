import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const LogicNode = ({ id, data }) => {
  return (
    <div className={`px-4 py-3 shadow-md rounded-md border-2 bg-white ${data.color} min-w-[160px] relative group`}>
      {/* Delete Button - hidden until hover */}
      <button 
        onClick={() => data.onDelete(id)}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
      >
        ✕
      </button>

      <Handle type="target" position={Position.Top} className="bg-gray-400" />
      
      <div className="flex flex-col">
        <label className={`text-[10px] font-bold uppercase mb-1 ${data.text}`}>
          {data.type}
        </label>
        <input
          type="text"
          defaultValue={data.label}
          onChange={(evt) => data.onChange(id, evt.target.value)}
          className="text-sm font-medium outline-hidden border-b border-transparent focus:border-gray-200"
          placeholder="Enter name..."
        />
      </div>

      <Handle type="source" position={Position.Bottom} className="bg-gray-400" />
    </div>
  );
};

export default memo(LogicNode);