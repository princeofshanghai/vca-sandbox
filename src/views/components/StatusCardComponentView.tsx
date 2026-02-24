import { useState } from 'react';
import { StatusCard } from '@/components/vca-components/status-card/StatusCard';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons, FormInput, FormTextarea } from '@/components/component-library/DemoControls';

const StatusCardComponentView = () => {
    // Interactive demo state
    const [status, setStatus] = useState<'in-progress' | 'complete'>('in-progress');
    const [title, setTitle] = useState('User removed from Flexis Recruiter');
    const [description, setDescription] = useState('You can view the updates in the Users & License Management tab in Admin Center.');
    const [actionLabel, setActionLabel] = useState('View Details');

    return (
        <ComponentViewLayout
            title="Status Card"
            description="Displays the real-time progress and outcome of an AI-driven action. Used to provide visual feedback during long-running tasks."
        >
            {/* Demo Section */}
            <div className="space-y-20">
                <DemoSection
                    controls={
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <ToggleButtons
                                label="Status"
                                options={['in-progress', 'complete'] as const}
                                value={status}
                                onChange={setStatus}
                            />

                            {/* Spacer for grid alignment */}
                            <div></div>

                            <FormInput
                                id="title"
                                label="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter title..."
                            />

                            {status === 'complete' && (
                                <>
                                    <FormInput
                                        id="actionLabel"
                                        label="Action label (optional)"
                                        value={actionLabel}
                                        onChange={(e) => setActionLabel(e.target.value)}
                                        placeholder="Action label..."
                                    />
                                    <FormTextarea
                                        id="description"
                                        label="Description (optional)"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter description..."
                                        rows={2}
                                        className="col-span-2"
                                    />
                                </>
                            )}
                        </div>
                    }
                >
                    <StatusCard
                        status={status}
                        title={title}
                        actionLabel={actionLabel}
                        onActionClick={() => alert('Action clicked')}
                    >
                        {description}
                    </StatusCard>
                </DemoSection>

                {/* Usage Section */}
                <div>
                    <h2 className="mb-8">Usage</h2>
                    <div className="space-y-12">
                        {/* In Progress State */}
                        <div>
                            <h3 className="mb-4">In Progress</h3>
                            <p className="mb-3 text-shell-muted">Shows a spinning sparkle animation and a looping progress bar.</p>
                            <div className="bg-shell-bg border border-shell-border rounded-lg p-6">
                                <StatusCard
                                    status="in-progress"
                                    title="Removing user..."
                                />
                            </div>
                        </div>

                        {/* Complete State (Rich Content) - User's Example */}
                        <div>
                            <h3 className="mb-4">Complete (Rich Content)</h3>
                            <p className="mb-3 text-shell-muted">Shows a success checkmark and can contain rich text descriptions and links.</p>
                            <div className="bg-shell-bg border border-shell-border rounded-lg p-6">
                                <StatusCard
                                    status="complete"
                                    title="User removed from Flexis Recruiter"
                                >
                                    <span>
                                        You can view the updates in the <a href="#">Users & License Management</a> tab in Admin Center.
                                    </span>
                                </StatusCard>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </ComponentViewLayout >
    );
};

export default StatusCardComponentView;
