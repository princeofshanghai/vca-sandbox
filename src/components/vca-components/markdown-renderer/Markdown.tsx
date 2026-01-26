import ReactMarkdown from 'react-markdown';
import { cn } from '@/utils';

interface MarkdownRendererProps {
    children: string;
    className?: string;
}

/**
 * MarkdownRenderer - Renders markdown with VCA typography tokens
 * 
 * This component inherits typography from its parent (e.g., Message uses text-vca-small-open)
 * and applies VCA-native styling to markdown elements without using Tailwind prose plugin
 * to avoid conflicts with VCA's custom design tokens.
 */
export const MarkdownRenderer = ({ children, className }: MarkdownRendererProps) => {
    return (
        <div className={cn(className)}>
            <ReactMarkdown
                components={{
                    // Paragraphs - inherit parent typography, minimal margin
                    p: ({ node: _node, ...props }) => (
                        <p className="my-1" {...props} />
                    ),
                    // Bold - use semibold weight within VCA system (600)
                    strong: ({ node: _node, ...props }) => (
                        <strong className="font-semibold" {...props} />
                    ),
                    // Italic - use italic style with inherited VCA font
                    em: ({ node: _node, ...props }) => (
                        <em {...props} />
                    ),
                    // Unordered lists - use VCA spacing, inherit text sizing
                    ul: ({ node: _node, ...props }) => (
                        <ul className="list-disc pl-4 space-y-1 my-2" {...props} />
                    ),
                    // Ordered lists - use VCA spacing, inherit text sizing
                    ol: ({ node: _node, ...props }) => (
                        <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />
                    ),
                    // List items - inherit VCA typography
                    li: ({ node: _node, ...props }) => (
                        <li {...props} />
                    ),
                    // Links - use VCA link color tokens with hover underline
                    a: ({ node: _node, ...props }) => (
                        <a
                            className="text-vca-link hover:underline font-semibold no-underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        />
                    ),
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
};
