import { useMemo, useState } from 'react';
import { DisplayCard, type DisplayCardEntity } from '@/components/vca-components/confirmation-card';
import { Message } from '@/components/vca-components/messages';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { Container } from '@/components/vca-components/container/Container';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { FormCheckbox, FormInput, ToggleButtons } from '@/components/component-library/DemoControls';
import { ExampleShowcase } from '@/views/patterns/components/ExampleShowcase';
import { Button } from '@/components/ui/button';

const AVATAR_URL = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

const ConfirmationCardComponentView = () => {
    const [showActions, setShowActions] = useState(true);
    const [visualType, setVisualType] = useState<'avatar' | 'icon' | 'none'>('avatar');
    const [showPhoto, setShowPhoto] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [title, setTitle] = useState('Acme Workspace');
    const [subtitle, setSubtitle] = useState('Enterprise account');
    const [confirmLabel, setConfirmLabel] = useState('Open workspace');
    const [rejectLabel, setRejectLabel] = useState('Choose another');
    const [lastAction, setLastAction] = useState<'none' | 'confirm' | 'reject'>('none');
    const [conversationState, setConversationState] = useState<'awaiting' | 'confirmed' | 'rejected'>('awaiting');

    const demoItem = useMemo<DisplayCardEntity>(() => ({
        id: 'acme-workspace',
        title: title || 'Acme Workspace',
        subtitle: subtitle || undefined,
        visualType,
        iconName: visualType === 'icon' ? ('building' as const) : undefined,
        imageUrl: visualType === 'avatar' && showPhoto ? AVATAR_URL : undefined,
    }), [title, subtitle, visualType, showPhoto]);

    return (
        <ComponentViewLayout
            title="Display Card"
            description="A richer card for showing a single entity with optional actions."
        >
            <div className="space-y-20">
                <DemoSection
                    controls={
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <FormCheckbox
                                id="show-actions"
                                label="show actions"
                                checked={showActions}
                                onCheckedChange={setShowActions}
                            />
                            <div />

                            <ToggleButtons
                                label="Visual"
                                options={['avatar', 'icon', 'none'] as const}
                                value={visualType}
                                onChange={setVisualType}
                            />
                            <div />

                            <FormInput
                                id="card-title"
                                label="Card title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Acme Workspace"
                            />
                            <FormInput
                                id="card-subtitle"
                                label="Subtitle"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                placeholder="Enterprise account"
                            />

                            {showActions ? (
                                <>
                                    <FormInput
                                        id="confirm-label"
                                        label="Primary cta"
                                        value={confirmLabel}
                                        onChange={(e) => setConfirmLabel(e.target.value)}
                                        placeholder="Open workspace"
                                    />
                                    <FormInput
                                        id="reject-label"
                                        label="Secondary cta"
                                        value={rejectLabel}
                                        onChange={(e) => setRejectLabel(e.target.value)}
                                        placeholder="Choose another"
                                    />
                                </>
                            ) : (
                                <div className="col-span-2 rounded-md border border-dashed border-shell-border bg-shell-surface-subtle px-3 py-2 text-xs text-shell-muted">
                                    This card is in display-only mode, so it renders with no buttons.
                                </div>
                            )}

                            <FormCheckbox
                                id="show-photo"
                                label="show photo"
                                checked={showPhoto}
                                onCheckedChange={setShowPhoto}
                                disabled={visualType !== 'avatar'}
                            />
                            <FormCheckbox
                                id="disabled-state"
                                label="disabled"
                                checked={disabled}
                                onCheckedChange={setDisabled}
                            />
                        </div>
                    }
                >
                    <div className="w-full rounded-xl bg-shell-surface-subtle p-6 flex flex-col items-center gap-3">
                        <DisplayCard
                            item={demoItem}
                            showActions={showActions}
                            confirmLabel={confirmLabel}
                            rejectLabel={rejectLabel}
                            disabled={disabled}
                            onConfirm={() => setLastAction('confirm')}
                            onReject={() => setLastAction('reject')}
                        />
                        {showActions && (
                            <p className="text-xs text-shell-muted">
                                Last action: {lastAction === 'none' ? 'none' : lastAction}
                            </p>
                        )}
                    </div>
                </DemoSection>

                <div className="space-y-12">
                    <div>
                        <h2>States</h2>
                        <p className="mt-4 text-shell-muted">
                            Use this component when the AI needs to highlight one richer item, account, or profile. Actions are optional.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-shell-surface-subtle border border-shell-border rounded-lg p-4">
                            <h3 className="text-sm font-semibold mb-3">Display only</h3>
                            <DisplayCard
                                item={{
                                    id: 'display',
                                    title: 'Acme Workspace',
                                    subtitle: 'Enterprise account',
                                    visualType: 'avatar',
                                    imageUrl: AVATAR_URL,
                                }}
                                showActions={false}
                            />
                        </div>

                        <div className="bg-shell-surface-subtle border border-shell-border rounded-lg p-4">
                            <h3 className="text-sm font-semibold mb-3">With actions</h3>
                            <DisplayCard
                                item={{
                                    id: 'actions',
                                    title: 'Team updates',
                                    subtitle: 'Private channel',
                                    visualType: 'icon',
                                    iconName: 'messages',
                                }}
                                showActions={true}
                                confirmLabel="Open channel"
                                rejectLabel="Dismiss"
                            />
                        </div>

                        <div className="bg-shell-surface-subtle border border-shell-border rounded-lg p-4">
                            <h3 className="text-sm font-semibold mb-3">Fallback visual</h3>
                            <DisplayCard
                                item={{
                                    id: 'fallback',
                                    title: 'Quarterly report',
                                    visualType: 'icon',
                                    iconName: 'document',
                                }}
                                showActions={false}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h2>Realistic Usage</h2>
                        <p className="mt-4 text-shell-muted">
                            Example flow where a display card includes two branching actions.
                        </p>
                    </div>

                    <ExampleShowcase title="Workspace Selection Flow">
                        <Container
                            headerTitle="Help"
                            className="h-[620px] mx-auto shadow-sm"
                            viewport="desktop"
                            composerStatus="default"
                            composerValue=""
                        >
                            <div className="flex flex-col gap-vca-lg">
                                <Message
                                    variant="user"
                                    userText="Open the Acme workspace"
                                    className="flex justify-end"
                                />

                                <Message
                                    variant="ai"
                                    defaultText="I found the workspace you're looking for."
                                />

                                {conversationState === 'awaiting' && (
                                    <DisplayCard
                                        item={{
                                            id: 'workspace',
                                            title: 'Acme Workspace',
                                            subtitle: 'Enterprise account',
                                            visualType: 'icon',
                                            iconName: 'building',
                                        }}
                                        showActions={true}
                                        confirmLabel={confirmLabel}
                                        rejectLabel={rejectLabel}
                                        onConfirm={() => setConversationState('confirmed')}
                                        onReject={() => setConversationState('rejected')}
                                    />
                                )}

                                {conversationState === 'confirmed' && (
                                    <>
                                        <Message
                                            variant="user"
                                            userText={confirmLabel}
                                            className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-200"
                                        />
                                        <Message
                                            variant="ai"
                                            defaultText="Opening the Acme workspace now."
                                            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                                        />
                                    </>
                                )}

                                {conversationState === 'rejected' && (
                                    <>
                                        <Message
                                            variant="user"
                                            userText={rejectLabel}
                                            className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-200"
                                        />
                                        <Message
                                            variant="ai"
                                            defaultText="No problem. Want to browse another workspace or search again?"
                                            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                                        />
                                        <PromptGroup
                                            prompts={[
                                                { text: 'Browse other workspaces' },
                                                { text: 'Search again' },
                                            ]}
                                        />
                                    </>
                                )}

                                {conversationState !== 'awaiting' && (
                                    <div className="pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="text-xs"
                                            onClick={() => setConversationState('awaiting')}
                                        >
                                            Reset demo
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Container>
                    </ExampleShowcase>
                </div>
            </div>
        </ComponentViewLayout>
    );
};

export default ConfirmationCardComponentView;
