import React from 'react';
import { MessageSquare, List, Type } from 'lucide-react';

export const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Components</h2>
        <p className="text-xs text-gray-500 mt-1">Drag to add to flow</p>
      </div>

      <div className="p-4 space-y-3">
        <div
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all"
          onDragStart={(event) => onDragStart(event, 'message')}
          draggable
        >
          <div className="p-2 bg-blue-50 rounded-md text-blue-600">
            <MessageSquare size={16} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Bot Message</div>
            <div className="text-xs text-gray-500">Standard text bubble</div>
          </div>
        </div>

        <div
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all"
          onDragStart={(event) => onDragStart(event, 'options')}
          draggable
        >
          <div className="p-2 bg-purple-50 rounded-md text-purple-600">
            <List size={16} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Options</div>
            <div className="text-xs text-gray-500">Selectable buttons</div>
          </div>
        </div>

        <div
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all"
          onDragStart={(event) => onDragStart(event, 'input')}
          draggable
        >
          <div className="p-2 bg-green-50 rounded-md text-green-600">
            <Type size={16} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">User Input</div>
            <div className="text-xs text-gray-500">Text field capture</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
