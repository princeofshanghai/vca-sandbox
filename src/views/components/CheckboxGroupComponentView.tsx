import { useState } from 'react';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { FormCheckbox } from '@/components/component-library/DemoControls';
import { CheckboxGroup, CheckboxOption } from '@/components/vca-components/checkbox-group/CheckboxGroup';

const funnelOptions: CheckboxOption[] = [
    { id: 'brand', label: 'Brand' },
    { id: 'content', label: 'Content Engagement' },
    { id: 'leads', label: 'Leads' },
];

const interestOptions: CheckboxOption[] = [
    { id: 'design', label: 'Product Design', description: 'UI/UX, prototyping, and user research.' },
    { id: 'dev', label: 'Development', description: 'Frontend, backend, and full-stack engineering.' },
    { id: 'marketing', label: 'Marketing', description: 'SEO, content, and growth strategies.' },
];

const CheckboxGroupComponentView = () => {
    // Demo Controls
    const [disabled, setDisabled] = useState(false);

    // Controlled State Example
    const [selectedInterests, setSelectedInterests] = useState<string[]>(['design']);

    return (
        <ComponentViewLayout
            title="Checkbox Group (WIP)"
            description="A managed group of checkboxes with optional header and actions."
        >
            <div className="space-y-20">

                {/* Interactive Demo - Funnel Example */}
                <DemoSection
                    controls={
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <FormCheckbox
                                id="disabled"
                                label="Disabled"
                                checked={disabled}
                                onCheckedChange={setDisabled}
                            />
                        </div>
                    }
                >
                    <div className="w-full max-w-sm bg-shell-bg p-6 rounded-lg shadow-sm border border-shell-border-subtle">
                        <CheckboxGroup
                            title="Which funnel stages should be part of the plan?"
                            options={funnelOptions.map(opt => ({ ...opt, disabled }))}
                            defaultValue={[]}
                            onSave={(ids) => alert(`Saved funnel stages: ${ids.join(', ')}`)}
                            onCancel={() => alert('Cancelled')}
                            saveLabel="Save funnel"
                        />
                    </div>
                </DemoSection>

                {/* Controlled Example with Descriptions */}
                <div className="space-y-12">
                    <div>
                        <h2 className="text-xl font-medium text-shell-text mb-4">Controlled Mode with Descriptions</h2>
                        <div className="p-8 border border-shell-border rounded-lg bg-shell-surface-subtle flex justify-center">
                            <div className="w-full max-w-md bg-shell-bg p-8 rounded-xl border border-shell-border shadow-sm">
                                <CheckboxGroup
                                    title="Select your interests"
                                    description="We'll customize your feed based on these choices."
                                    options={interestOptions}
                                    value={selectedInterests}
                                    onChange={setSelectedInterests}
                                    onSave={(ids) => alert(`Updated interests: ${ids.join(', ')}`)}
                                    saveLabel="Update Preferences"
                                />
                                <div className="mt-6 pt-4 border-t border-shell-border-subtle text-xs text-shell-muted">
                                    Current Selection: {selectedInterests.join(', ') || 'None'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </ComponentViewLayout>
    );
};

export default CheckboxGroupComponentView;
