import ReactMarkdown from 'react-markdown';
import {
    createVCAMarkdownComponents,
    getVCAMarkdownWrapperClassName,
    type VCAMarkdownLinkMode,
    type VCAMarkdownSpacing,
    type VCAMarkdownTextTone,
} from './vcaMarkdownTheme';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    linkMode?: VCAMarkdownLinkMode;
    spacing?: VCAMarkdownSpacing;
    textTone?: VCAMarkdownTextTone;
}

export function MarkdownRenderer({
    content,
    className,
    linkMode = 'interactive',
    spacing = 'default',
    textTone = 'default',
}: MarkdownRendererProps) {
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

    const combinedClassName = getVCAMarkdownWrapperClassName(className, textTone);

    return (
        <div className={combinedClassName}>
            <ReactMarkdown components={createVCAMarkdownComponents({ linkMode, spacing, textTone })}>
                {normalizedContent}
            </ReactMarkdown>
        </div>
    );
}
