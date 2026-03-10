import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    if (!content) return null;

    const normalizedContent = content.replace(
        /\*\*(\s*)([^*\n]+?)(\s*)\*\*/g,
        (match, leadingSpace, innerText, trailingSpace) => {
            if (!leadingSpace && !trailingSpace) {
                return match;
            }
            return `${leadingSpace}**${innerText}**${trailingSpace}`;
        }
    );

    // We bypass cn() for the main typography classes because tailwind-merge
    // incorrectly strips 'text-vca-small-open' in favor of 'text-vca-text'.
    // See docs/archive/Tailwind-Merge-Typography-Fix.md
    const baseClasses = "font-vca-text text-vca-small-open text-vca-text";
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
                        <p {...props} className="font-vca-text text-vca-small-open text-vca-text mb-2 last:mb-0" />
                    ),
                    // Strong/Bold
                    strong: ({ node: _node, ...props }) => (
                        <strong {...props} className="font-vca-text text-vca-small-bold-open text-vca-text" />
                    ),
                    b: ({ node: _node, ...props }) => (
                        <strong {...props} className="font-vca-text text-vca-small-bold-open text-vca-text" />
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
                        <ul {...props} className="text-vca-small-open text-vca-text list-disc pl-4 my-2 space-y-1.5" />
                    ),
                    ol: ({ node: _node, ...props }) => (
                        <ol {...props} className="text-vca-small-open text-vca-text list-decimal pl-4 my-2 space-y-1.5 [&>li::marker]:font-vca-text [&>li::marker]:text-vca-small-bold-open" />
                    ),
                    li: ({ node: _node, ...props }) => (
                        <li {...props} className="font-vca-text text-vca-small-open text-vca-text pl-0" />
                    ),
                }}
            >
                {normalizedContent}
            </ReactMarkdown>
        </div>
    );
}
