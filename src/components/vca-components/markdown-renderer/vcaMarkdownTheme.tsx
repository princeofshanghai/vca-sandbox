import { toast } from 'sonner';
import type { Components } from 'react-markdown';

export type VCAMarkdownSpacing = 'default' | 'compact';
export type VCAMarkdownLinkMode = 'interactive' | 'static';
export type VCAMarkdownTextTone = 'default' | 'inherit';

// Internal placeholder used when Studio needs link styling before a real destination exists.
export const VCA_PENDING_LINK_HREF = 'https://vca-preview-link.invalid/';
export const isPendingVCALinkHref = (href?: string | null) => href === VCA_PENDING_LINK_HREF;

const defaultParagraphSpacingClasses = 'mb-2 last:mb-0';
const compactParagraphSpacingClasses = 'mb-1.5 last:mb-0';
const defaultListSpacingClasses = 'my-2 space-y-1.5';
const compactListSpacingClasses = 'my-1.5 space-y-1';

const baseTextClassesByTone: Record<VCAMarkdownTextTone, string> = {
    default: 'font-vca-text text-vca-small-open text-vca-text',
    inherit: 'font-vca-text text-vca-small-open text-current',
};

const boldTextClassesByTone: Record<VCAMarkdownTextTone, string> = {
    default: 'font-vca-text text-vca-small-bold-open text-vca-text',
    inherit: 'font-vca-text text-vca-small-bold-open text-current',
};

export const getVCAMarkdownWrapperClassName = (
    className?: string,
    textTone: VCAMarkdownTextTone = 'default'
) => {
    const baseTextClasses = baseTextClassesByTone[textTone];
    return className ? `${baseTextClasses} ${className}` : baseTextClasses;
};

export const vcaRichTextEditorContentClassName = [
    'max-w-none outline-none min-h-full p-2.5',
    baseTextClassesByTone.default,
    '[&_.is-editor-empty:first-child::before]:pointer-events-none',
    '[&_.is-editor-empty:first-child::before]:float-left',
    '[&_.is-editor-empty:first-child::before]:h-0',
    '[&_.is-editor-empty:first-child::before]:text-shell-muted/55',
    '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
    '[&_a]:font-vca-text [&_a]:text-vca-small-open [&_a]:text-vca-link hover:[&_a]:text-vca-link-hover hover:[&_a]:underline',
    '[&_p]:font-vca-text [&_p]:text-vca-small-open [&_p]:text-vca-text [&_p]:my-2 first:[&_p]:mt-0 last:[&_p]:mb-0',
    '[&_strong]:font-vca-text [&_strong]:text-vca-small-bold-open [&_strong]:text-vca-text',
    '[&_b]:font-vca-text [&_b]:text-vca-small-bold-open [&_b]:text-vca-text',
    '[&_em]:italic',
    '[&_i]:italic',
    '[&_ul]:font-vca-text [&_ul]:text-vca-small-open [&_ul]:text-vca-text [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-2 [&_ul]:space-y-1.5',
    '[&_ol]:font-vca-text [&_ol]:text-vca-small-open [&_ol]:text-vca-text [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_ol]:space-y-1.5',
    '[&_ol>li::marker]:font-vca-text [&_ol>li::marker]:text-vca-small-open [&_ol>li::marker]:text-vca-text [&_ol>li::marker]:font-normal',
    '[&_ul>li::marker]:text-vca-text',
    '[&_li]:font-vca-text [&_li]:text-vca-small-open [&_li]:text-vca-text [&_li]:my-0 [&_li]:pl-0',
    '[&_li_p]:m-0 [&_li_p]:inline',
].join(' ');

export function createVCAMarkdownComponents({
    linkMode = 'interactive',
    spacing = 'default',
    textTone = 'default',
}: {
    linkMode?: VCAMarkdownLinkMode;
    spacing?: VCAMarkdownSpacing;
    textTone?: VCAMarkdownTextTone;
} = {}): Components {
    const paragraphSpacingClasses =
        spacing === 'compact' ? compactParagraphSpacingClasses : defaultParagraphSpacingClasses;
    const listSpacingClasses =
        spacing === 'compact' ? compactListSpacingClasses : defaultListSpacingClasses;
    const baseTextClasses = baseTextClassesByTone[textTone];
    const boldTextClasses = boldTextClassesByTone[textTone];
    const orderedListMarkerClasses =
        textTone === 'inherit'
            ? '[&>li::marker]:font-vca-text [&>li::marker]:text-vca-small-open [&>li::marker]:text-current [&>li::marker]:font-normal'
            : '[&>li::marker]:font-vca-text [&>li::marker]:text-vca-small-open [&>li::marker]:text-vca-text [&>li::marker]:font-normal';
    const unorderedListMarkerClass = textTone === 'inherit' ? '[&>li::marker]:text-current' : '[&>li::marker]:text-vca-text';
    const staticLinkClasses =
        textTone === 'inherit'
            ? 'font-vca-text text-vca-small-open font-semibold text-current no-underline'
            : 'font-vca-text text-vca-small-open font-semibold text-vca-link no-underline';
    const interactiveLinkClasses =
        textTone === 'inherit'
            ? 'font-vca-text text-vca-small-open text-current hover:underline'
            : 'font-vca-text text-vca-small-open text-vca-link hover:text-vca-link-hover hover:underline';

    return {
        a: ({ node: _node, children, ...props }) => {
            if (isPendingVCALinkHref(props.href)) {
                if (linkMode === 'static') {
                    return <span className={`${staticLinkClasses} vca-static-link`}>{children}</span>;
                }

                return (
                    <a
                        {...props}
                        className={`${interactiveLinkClasses} cursor-pointer`}
                        onClick={(event) => {
                            event.preventDefault();
                            toast('Link destination not set yet');
                        }}
                    >
                        {children}
                    </a>
                );
            }

            if (linkMode === 'static') {
                return <span className={`${staticLinkClasses} vca-static-link`}>{children}</span>;
            }

            return (
                <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={interactiveLinkClasses}
                >
                    {children}
                </a>
            );
        },
        p: ({ node: _node, ...props }) => (
            <p {...props} className={`${baseTextClasses} ${paragraphSpacingClasses}`} />
        ),
        strong: ({ node: _node, ...props }) => (
            <strong {...props} className={boldTextClasses} />
        ),
        b: ({ node: _node, ...props }) => (
            <strong {...props} className={boldTextClasses} />
        ),
        em: ({ node: _node, ...props }) => <em {...props} className="italic" />,
        i: ({ node: _node, ...props }) => <em {...props} className="italic" />,
        ul: ({ node: _node, ...props }) => (
            <ul {...props} className={`${baseTextClasses} list-disc pl-4 ${listSpacingClasses} ${unorderedListMarkerClass}`} />
        ),
        ol: ({ node: _node, ...props }) => (
            <ol
                {...props}
                className={`${baseTextClasses} list-decimal pl-5 ${listSpacingClasses} ${orderedListMarkerClasses}`}
            />
        ),
        li: ({ node: _node, ...props }) => (
            <li {...props} className={`${baseTextClasses} pl-0 [&>p]:m-0 [&>p]:inline`} />
        ),
    };
}
