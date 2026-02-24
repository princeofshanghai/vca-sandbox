import { AIStatusContent } from './types';
import { RichTextEditor } from '../studio-canvas/components/RichTextEditor';

export const ActionBlockEditor = ({ content, onChange }: { content: AIStatusContent, onChange: (c: AIStatusContent) => void }) => {
    return (
        <div className="space-y-6">
            {/* In Progress (Shared) */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-shell-muted">Loading State</label>
                <input
                    className="w-full text-sm font-medium text-shell-text border border-shell-border rounded-md p-2 bg-shell-bg focus:ring-2 focus:ring-shell-accent/20 focus:border-shell-accent-border transition-all"
                    placeholder="Ex. Removing user..."
                    value={content.loadingTitle || ''}
                    onChange={(e) => onChange({ ...content, loadingTitle: e.target.value })}
                />
            </div>

            {/* Success State */}
            <div className="space-y-3">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-shell-muted">Title</label>
                    <input
                        className="w-full text-sm font-medium text-shell-text border border-shell-border rounded-md p-2 bg-shell-bg focus:ring-2 focus:ring-shell-accent/20 focus:border-shell-accent-border transition-all"
                        placeholder="Ex. User removed"
                        value={content.successTitle || ''}
                        onChange={(e) => onChange({ ...content, successTitle: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-shell-muted">Message</label>
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
