import { AIStatusContent } from './types';
import { RichTextEditor } from '../studio-canvas/components/RichTextEditor';

export const ActionBlockEditor = ({ content, onChange }: { content: AIStatusContent, onChange: (c: AIStatusContent) => void }) => {
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

            {/* Success State */}
            <div className="space-y-3">
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
        </div>
    );
};
