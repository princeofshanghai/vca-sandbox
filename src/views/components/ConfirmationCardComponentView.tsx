import { useMemo, useState } from 'react';
import { ConfirmationCard, type ConfirmationEntity } from '@/components/vca-components/confirmation-card';
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
    const [visualType, setVisualType] = useState<'avatar' | 'icon' | 'none'>('avatar');
    const [showPhoto, setShowPhoto] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [title, setTitle] = useState('Sarah Jenkins');
    const [subtitle, setSubtitle] = useState('sarah.j@example.com');
    const [confirmLabel, setConfirmLabel] = useState('Yes, confirm');
    const [rejectLabel, setRejectLabel] = useState('No, not this person');
    const [lastAction, setLastAction] = useState<'none' | 'confirm' | 'reject'>('none');
    const [conversationState, setConversationState] = useState<'awaiting' | 'confirmed' | 'rejected'>('awaiting');

    const demoItem = useMemo<ConfirmationEntity>(() => ({
        id: 'sarah-jenkins',
        title: title || 'Sarah Jenkins',
        subtitle: subtitle || undefined,
        visualType,
        iconName: visualType === 'icon' ? ('user' as const) : undefined,
        imageUrl: visualType === 'avatar' && showPhoto ? AVATAR_URL : undefined,
    }), [title, subtitle, visualType, showPhoto]);

    return (
        <ComponentViewLayout
            title="Confirmation Card"
            description="A focused confirmation card for a single candidate with two clear actions: confirm or reject."
        >
            <div className="space-y-20">
                <DemoSection
                    controls={
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <ToggleButtons
                                label="Visual"
                                options={['avatar', 'icon', 'none'] as const}
                                value={visualType}
                                onChange={setVisualType}
                            />
                            <div />

                            <FormInput
                                id="candidate-name"
                                label="Candidate name"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Sarah Jenkins"
                            />
                            <FormInput
                                id="candidate-subtitle"
                                label="Subtitle"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                placeholder="sarah.j@example.com"
                            />

                            <FormInput
                                id="confirm-label"
                                label="Confirm button"
                                value={confirmLabel}
                                onChange={(e) => setConfirmLabel(e.target.value)}
                                placeholder="Yes, confirm"
                            />
                            <FormInput
                                id="reject-label"
                                label="Reject button"
                                value={rejectLabel}
                                onChange={(e) => setRejectLabel(e.target.value)}
                                placeholder="No, not this person"
                            />

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
                        <ConfirmationCard
                            item={demoItem}
                            confirmLabel={confirmLabel}
                            rejectLabel={rejectLabel}
                            disabled={disabled}
                            onConfirm={() => setLastAction('confirm')}
                            onReject={() => setLastAction('reject')}
                        />
                        <p className="text-xs text-shell-muted">
                            Last action: {lastAction === 'none' ? 'none' : lastAction}
                        </p>
                    </div>
                </DemoSection>

                <div className="space-y-12">
                    <div>
                        <h2>States</h2>
                        <p className="mt-4 text-shell-muted">
                            Use this component when the AI already narrowed to one candidate and needs a clear yes/no confirmation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-shell-surface-subtle border border-shell-border rounded-lg p-4">
                            <h3 className="text-sm font-semibold mb-3">Happy</h3>
                            <ConfirmationCard
                                item={{
                                    id: 'happy',
                                    title: 'Sarah Jenkins',
                                    subtitle: 'sarah.j@example.com',
                                    visualType: 'avatar',
                                    imageUrl: AVATAR_URL,
                                }}
                            />
                        </div>

                        <div className="bg-shell-surface-subtle border border-shell-border rounded-lg p-4">
                            <h3 className="text-sm font-semibold mb-3">Loading</h3>
                            <ConfirmationCard
                                item={{
                                    id: 'loading',
                                    title: 'Looking up user...',
                                    subtitle: 'Please wait',
                                    visualType: 'none',
                                }}
                                disabled={true}
                                confirmLabel="Confirm"
                                rejectLabel="Not correct"
                            />
                        </div>

                        <div className="bg-shell-surface-subtle border border-shell-border rounded-lg p-4">
                            <h3 className="text-sm font-semibold mb-3">Empty / fallback</h3>
                            <ConfirmationCard
                                item={{
                                    id: 'fallback',
                                    title: 'Unknown candidate',
                                    visualType: 'icon',
                                    iconName: 'user',
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h2>Realistic Usage</h2>
                        <p className="mt-4 text-shell-muted">
                            Example flow for remove-user confirmation with separate outcomes for confirm and reject.
                        </p>
                    </div>

                    <ExampleShowcase title="Remove User Confirmation Flow">
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
                                    userText="Remove user Sarah Jenkins"
                                    className="flex justify-end"
                                />

                                <Message
                                    variant="ai"
                                    defaultText="I found this user. Is this the right person?"
                                />

                                {conversationState === 'awaiting' && (
                                    <ConfirmationCard
                                        item={{
                                            id: 'sarah',
                                            title: 'Sarah Jenkins',
                                            subtitle: 'sarah.j@example.com',
                                            visualType: 'avatar',
                                            imageUrl: AVATAR_URL,
                                        }}
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
                                            defaultText="Done. Sarah Jenkins has been removed from the project."
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
                                            defaultText="No problem. Want to search by email or try another name?"
                                            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                                        />
                                        <PromptGroup
                                            prompts={[
                                                { text: 'Search by email' },
                                                { text: 'Try another name' },
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
