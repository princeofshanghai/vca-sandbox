import { useState } from 'react';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormCheckbox } from '@/components/component-library/DemoControls';
import { Checkbox } from '@/components/vca-components/checkbox';

const CheckboxComponentView = () => {
    // Interactive demo state matches ButtonComponentView pattern
    const [checkedState, setCheckedState] = useState<'Unchecked' | 'Checked' | 'Indeterminate'>('Unchecked');
    const [disabled, setDisabled] = useState(false);
    const [showLabel, setShowLabel] = useState(true);
    const [showDescription, setShowDescription] = useState(false);

    // Map string state back to component prop
    const getCheckedProp = () => {
        if (checkedState === 'Checked') return true;
        if (checkedState === 'Indeterminate') return 'indeterminate';
        return false;
    };

    return (
        <ComponentViewLayout
            title="Checkbox (WIP)"
            description="A control that allows the user to toggle between checked and not checked."
        >
            <div className="space-y-20"> {/* Matches spacing in ButtonView */}

                {/* Interactive Demo */}
                <DemoSection
                    controls={
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <ToggleButtons
                                label="State"
                                options={['Unchecked', 'Checked', 'Indeterminate'] as const}
                                value={checkedState}
                                onChange={setCheckedState}
                            />

                            <div className="col-span-2 border-t border-shell-border-subtle my-2"></div>

                            <FormCheckbox
                                id="showLabel"
                                label="Show label"
                                checked={showLabel}
                                onCheckedChange={setShowLabel}
                            />

                            <FormCheckbox
                                id="showDescription"
                                label="Show description"
                                checked={showDescription}
                                onCheckedChange={setShowDescription}
                            />

                            <FormCheckbox
                                id="disabled"
                                label="Disabled"
                                checked={disabled}
                                onCheckedChange={setDisabled}
                            />
                        </div>
                    }
                >
                    <Checkbox
                        id="demo-checkbox"
                        checked={getCheckedProp()}
                        // Update local state when user clicks the checkbox directly
                        onCheckedChange={(val) => {
                            if (val === 'indeterminate') setCheckedState('Indeterminate');
                            else if (val === true) setCheckedState('Checked');
                            else setCheckedState('Unchecked');
                        }}
                        disabled={disabled}
                        label={showLabel ? "Accept terms and conditions" : undefined}
                        description={showDescription ? "You agree to our Terms of Service and Privacy Policy." : undefined}
                    />
                </DemoSection>

                {/* States Grid */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">States</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg flex flex-col items-center gap-3">
                            <span className="text-xs text-shell-muted uppercase font-medium">Unchecked</span>
                            <Checkbox checked={false} />
                        </div>
                        <div className="p-4 border rounded-lg flex flex-col items-center gap-3">
                            <span className="text-xs text-shell-muted uppercase font-medium">Checked</span>
                            <Checkbox checked={true} />
                        </div>
                        <div className="p-4 border rounded-lg flex flex-col items-center gap-3">
                            <span className="text-xs text-shell-muted uppercase font-medium">Indeterminate</span>
                            <Checkbox checked="indeterminate" />
                        </div>
                        <div className="p-4 border rounded-lg flex flex-col items-center gap-3">
                            <span className="text-xs text-shell-muted uppercase font-medium">Disabled</span>
                            <Checkbox checked={true} disabled />
                        </div>
                    </div>
                </div>

                {/* Form Example */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Form Layout</h3>
                    <div className="bg-shell-bg border rounded-xl overflow-hidden max-w-md">
                        <div className="p-4 border-b bg-shell-surface-subtle">
                            <h4 className="font-medium text-sm">Notification Settings</h4>
                        </div>
                        <div className="p-6 space-y-4">
                            <Checkbox
                                id="notify-email"
                                label="Email Notifications"
                                description="Receive daily summaries via email."
                                defaultChecked
                            />
                            <Checkbox
                                id="notify-sms"
                                label="SMS Notifications"
                                description="Receive urgent alerts via text message."
                            />
                            <Checkbox
                                id="notify-marketing"
                                label="Marketing Emails"
                                description="Receive news and special offers."
                                disabled
                            />
                        </div>
                    </div>
                </div>

            </div>
        </ComponentViewLayout>
    );
};

export default CheckboxComponentView;
