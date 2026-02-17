
import { useState } from 'react';
import { AIStatusContent } from './types';
import { RichTextEditor } from '../studio-canvas/components/RichTextEditor';
import { cn } from '@/utils/cn';

export const ActionBlockEditor = ({ content, onChange }: { content: AIStatusContent, onChange: (c: AIStatusContent) => void }) => {
    const [tab, setTab] = useState<'success' | 'failure'>('success');

    return (
        <div className="space-y-6">
            {/* In Progress (Shared) */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">Loading State</label>
                <input
                    className="w-full text-sm font-medium text-gray-900 border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                    placeholder="Ex. Removing user..."
                    value={content.loadingTitle || ''}
                    onChange={(e) => onChange({ ...content, loadingTitle: e.target.value })}
                />
            </div>

            {/* Outcome Switcher */}
            <div>
                <div className="flex items-center gap-6 border-b border-gray-100 mb-4">
                    <button
                        onClick={() => setTab('success')}
                        className={cn(
                            "text-sm font-medium pb-2 border-b-2 transition-all",
                            tab === 'success' ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                        )}
                    >
                        Success
                    </button>
                    <button
                        onClick={() => setTab('failure')}
                        className={cn(
                            "text-sm font-medium pb-2 border-b-2 transition-all",
                            tab === 'failure' ? "border-amber-500 text-amber-600" : "border-transparent text-gray-400 hover:text-gray-600"
                        )}
                    >
                        Failure
                    </button>
                </div>

                {tab === 'success' ? (
                    <div className="space-y-3 animation-in fade-in slide-in-from-left-2 duration-200">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Title</label>
                            <input
                                className="w-full text-sm font-medium text-gray-900 border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                                placeholder="Ex. User removed"
                                value={content.successTitle || ''}
                                onChange={(e) => onChange({ ...content, successTitle: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Message</label>
                            <RichTextEditor
                                value={content.successDescription || ''}
                                onChange={(value) => onChange({ ...content, successDescription: value })}
                                placeholder="Extra details..."
                                className="w-full"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 animation-in fade-in slide-in-from-right-2 duration-200">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Error Title</label>
                            <input
                                className="w-full text-sm font-medium text-gray-900 border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-amber-100 focus:border-amber-300 transition-all"
                                placeholder="Ex. Could not remove user"
                                value={content.failureTitle || ''}
                                onChange={(e) => onChange({ ...content, failureTitle: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Error Message</label>
                            <RichTextEditor
                                value={content.failureDescription || ''}
                                onChange={(value) => onChange({ ...content, failureDescription: value })}
                                placeholder="Explain what went wrong..."
                                className="w-full"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
