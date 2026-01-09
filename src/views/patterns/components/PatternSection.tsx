import { ReactNode } from 'react';

export type PatternSectionProps = {
    title: string;
    description?: string; // Optional because sometime we might just have a header
    children: ReactNode;
};

export const PatternSection = ({ title, description, children }: PatternSectionProps) => {
    // Generate ID for anchor links if not provided (matches OnThisPage logic)
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    return (
        <section>
            <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-semibold rounded uppercase tracking-wide">Pattern</span>
                <h3 id={id} className="text-lg font-medium m-0 scroll-mt-24">{title}</h3>
            </div>

            {description && (
                <div className="text-gray-600 mb-8 max-w-6xl">
                    <p className="mb-4">
                        {description}
                    </p>
                </div>
            )}

            {children}
        </section>
    );
};
