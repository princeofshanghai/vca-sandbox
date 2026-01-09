import { ReactNode } from 'react';

export type ExampleShowcaseProps = {
    title: string;
    children: ReactNode;
    rationale?: string[]; // Array of reasons "Why this works"
};

export const ExampleShowcase = ({ title, children, rationale }: ExampleShowcaseProps) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 uppercase">{title}</span>
            </div>
            <div className="p-6 bg-gray-50/50">
                <div className="flex justify-center">
                    {children}
                </div>
            </div>
            {rationale && rationale.length > 0 && (
                <div className="p-4 bg-white border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Why this works:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {rationale.map((item, index) => (
                            <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                            // Using dangerouslySetInnerHTML to allow bold tags like "<strong>Realistic Presentation:</strong>" if passed
                            // Alternatively we can parse it, but for internal doc tools this is usually fine/flexible.
                            // Let's stick to simple strings or ReactNodes if we want to be safer, 
                            // but purely string arrays are easier for the consumer.
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
