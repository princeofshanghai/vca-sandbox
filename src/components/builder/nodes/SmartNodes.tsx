import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { SmartNodeCard } from './SmartNodeCard';
import { SmartCollectNodeData, SmartSlot, SmartActionNodeData, SmartResponseNodeData, SmartFollowUpNodeData } from '@/types/smartFlow';

// 1. Entry Node
export const SmartEntryNode = memo((props: NodeProps) => {
    const data = props.data as any; // Cast to specific type if needed
    const entryId = data.entryPointId || 'default';

    return (
        <SmartNodeCard
            title="Context & Entry"
            colorClass="bg-purple-600"
            selected={props.selected}
            handles="source"
        >
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Entry Point</span>
                    <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{entryId}</span>
                </div>
                <div className="text-xs italic text-gray-500 border-l-2 border-gray-200 pl-2">
                    "{data.greetingConfig?.props?.content || 'Hello...'}"
                </div>
            </div>
        </SmartNodeCard>
    );
});

// 2. Collect Node
export const SmartCollectNode = memo((props: NodeProps) => {
    const data = props.data as unknown as SmartCollectNodeData;

    return (
        <SmartNodeCard
            title="Required Information"
            colorClass="bg-blue-600"
            selected={props.selected}
        >
            <div className="space-y-1">
                {data.slots?.map((slot: SmartSlot, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 p-1.5 rounded border border-gray-100">
                        <span className="font-mono text-gray-400">#{i + 1}</span>
                        <span className="font-medium text-gray-700">{slot.variable}</span>
                        <span className="ml-auto text-[10px] uppercase text-gray-400 border border-gray-200 px-1 rounded">{slot.type}</span>
                    </div>
                ))}
                {(!data.slots || data.slots.length === 0) && <span className="text-xs text-gray-400">No slots defined</span>}
            </div>
        </SmartNodeCard>
    );
});

// 3. Action Node
export const SmartActionNode = memo((props: NodeProps) => {
    const data = props.data as unknown as SmartActionNodeData;
    return (
        <SmartNodeCard
            title="System Action"
            colorClass="bg-amber-600"
            selected={props.selected}
        >
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="font-mono text-xs text-gray-700">{data.actionId}</span>
            </div>
        </SmartNodeCard>
    );
});

// 4. Response Node
export const SmartResponseNode = memo((props: NodeProps) => {
    const data = props.data as unknown as SmartResponseNodeData;
    return (
        <SmartNodeCard
            title="Response"
            colorClass="bg-teal-600"
            selected={props.selected}
        >
            <div className="bg-teal-50 p-2 rounded text-xs text-teal-800 border border-teal-100">
                <span className="font-bold block mb-1 uppercase text-[10px] tracking-wider">{data.component.type}</span>
                <span className="opacity-80 line-clamp-2">{JSON.stringify(data.component.props)}</span>
            </div>
        </SmartNodeCard>
    );
});

// 5. Follow Up Node
export const SmartFollowUpNode = memo((props: NodeProps) => {
    const data = props.data as unknown as SmartFollowUpNodeData;
    return (
        <SmartNodeCard
            title="Follow Up"
            colorClass="bg-indigo-600"
            selected={props.selected}
        >
            <div className="text-xs text-gray-600 mb-2">"{data.text}"</div>
            <div className="flex flex-wrap gap-1">
                {data.suggestions?.map((s, i) => (
                    <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                        {s}
                    </span>
                ))}
            </div>
        </SmartNodeCard>
    );
});
