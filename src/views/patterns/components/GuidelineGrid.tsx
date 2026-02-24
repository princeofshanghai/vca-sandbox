

export type GuidelineGridProps = {
    dos: string[];
    donts: string[];
};

export const GuidelineGrid = ({ dos, donts }: GuidelineGridProps) => {
    return (
        <section>
            <div className="text-lg font-medium mb-4">Guidelines</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-50 rounded-lg border border-green-100">
                    <h4 className="text-green-800 text-sm font-bold uppercase tracking-wider mb-3">Do</h4>
                    <ul className="space-y-2 text-sm text-shell-muted-strong">
                        {dos.map((item, index) => (
                            <li key={index} className="flex gap-2">
                                <span className="text-green-600">✓</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-6 bg-red-50 rounded-lg border border-red-100">
                    <h4 className="text-red-800 text-sm font-bold uppercase tracking-wider mb-3">Don't</h4>
                    <ul className="space-y-2 text-sm text-shell-muted-strong">
                        {donts.map((item, index) => (
                            <li key={index} className="flex gap-2">
                                <span className="text-red-500">×</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};
