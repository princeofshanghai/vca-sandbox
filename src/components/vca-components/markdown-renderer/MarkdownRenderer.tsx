import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    if (!content) return null;

    // We bypass cn() for the main typography classes because tailwind-merge
    // incorrectly strips 'text-vca-small-open' in favor of 'text-vca-text'.
    // See docs/archive/Tailwind-Merge-Typography-Fix.md
    const baseClasses = "text-vca-small-open text-vca-text";
    const combinedClassName = className ? `${baseClasses} ${className}` : baseClasses;

    return (
        <div className={combinedClassName}>
            <ReactMarkdown
                components={{
                    // Override link to open in new tab
                    a: ({ node: _node, ...props }) => (
                        <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-vca-link hover:text-vca-link-hover hover:underline"
                        />
                    ),
                    // Paragraphs - explicit VCA body style to override global CSS (text-15)
                    p: ({ node: _node, ...props }) => (
                        <p {...props} className="text-vca-small-open mb-2 last:mb-0" />
                    ),
                    // Strong/Bold
                    strong: ({ node: _node, ...props }) => (
                        <strong {...props} className="font-vca-text text-vca-small-bold-open" />
                    ),
                    b: ({ node: _node, ...props }) => (
                        <strong {...props} className="font-vca-text text-vca-small-bold-open" />
                    ),
                    // Emphasis/Italic
                    em: ({ node: _node, ...props }) => (
                        <em {...props} className="italic" />
                    ),
                    i: ({ node: _node, ...props }) => (
                        <em {...props} className="italic" />
                    ),
                    // Lists
                    ul: ({ node: _node, ...props }) => (
                        <ul {...props} className="text-vca-small-open text-vca-text list-disc pl-5 my-2 space-y-0.5" />
                    ),
                    ol: ({ node: _node, ...props }) => (
                        <ol {...props} className="text-vca-small-open text-vca-text list-decimal pl-5 my-2 space-y-0.5" />
                    ),
                    li: ({ node: _node, ...props }) => (
                        <li {...props} className="pl-1" />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
