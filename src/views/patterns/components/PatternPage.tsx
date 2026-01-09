import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type PatternPageProps = {
    title: string;
    description: string;
    children: ReactNode;
    relatedComponents?: { label: string; path: string }[];
};

import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';

export const PatternPage = ({ title, description, children, relatedComponents }: PatternPageProps) => {
    return (
        <ComponentViewLayout
            title={title}
            description={description}
        >
            <div className="w-full">
                {relatedComponents && relatedComponents.length > 0 && (
                    <div className="mb-12 flex items-center gap-3 text-sm">
                        <span className="text-gray-400 uppercase tracking-wider font-semibold text-xs">Related Components:</span>
                        <div className="flex gap-2">
                            {relatedComponents.map((comp, idx) => (
                                <Link
                                    key={idx}
                                    to={comp.path}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                >
                                    {comp.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-20">
                    {children}
                </div>
            </div>
        </ComponentViewLayout>
    );
};
