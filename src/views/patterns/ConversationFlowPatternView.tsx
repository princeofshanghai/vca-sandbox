import { useState, useEffect } from 'react';
import { PatternPage, PatternSection, GuidelineGrid, ExampleShowcase } from './components';
import { Message } from '@/components/vca-components/messages';
import { ActionStatus } from '@/components/vca-components/action-status/ActionStatus';
import { Container } from '@/components/vca-components/container/Container';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';


const ConversationFlowPatternView = () => {
    return (
        <PatternPage
            title="Conversation Flow"
            description="Every interaction follows a standard lifecycle: Welcome, Intent Recognition, Information Gathering, Action, and Follow Up. Understanding this flow ensures a consistent, high-quality experience across all skills."
            relatedComponents={[
                { label: 'Message', path: '/components/message' },
                { label: 'Prompt Group', path: '/components/prompt-group' },
                { label: 'Action Status', path: '/components/action-status' },
                { label: 'Container', path: '/components/container' }
            ]}
        >
            {/* 1. Welcome */}
            <div className="border-b border-gray-200 pb-16">
                <h2 id="welcome" className="scroll-mt-24 mb-4">Welcome</h2>
                <p className="text-gray-600 mb-10 max-w-3xl text-lg">
                    The welcome stage sets the tone. It should be contextual, leveraging the user's current page or recent actions to offer relevant shortcuts immediately.
                </p>

                <PatternSection
                    title="Contextual Introduction"
                    description="When a user opens the AI chat, we should leverage their current context (e.g., the page they are on, recent actions) to provide a tailored greeting."
                >
                    <div className="space-y-16">
                        <div className="space-y-8">
                            <ExampleShowcase
                                title="EXAMPLE: RECRUITER HELP CENTER"
                                rationale={[
                                    "Acknowledges the product context (Recruiter)",
                                    "Clearly states capabilities (answer questions, connect to team)",
                                    "Provides specific, relevant starting points with Prompts"
                                ]}
                            >
                                <Container
                                    headerTitle="Help"
                                    className="h-[500px] shadow-sm"
                                    viewport="desktop"
                                >
                                    <div className="space-y-vca-lg px-4 pt-4">
                                        <Message type="disclaimer" />
                                        <Message
                                            type="ai"
                                            defaultText="Hi there. With the help of AI, I can answer questions about Recruiter solutions or connect you to our team."
                                        />
                                        <Message
                                            type="ai"
                                            defaultText="Not sure where to start? You can try:"
                                        />
                                        <PromptGroup
                                            prompts={[
                                                { text: "How do I find my InMail credits?" },
                                                { text: "How can admins manage permissions for other admins?" },
                                                { text: "Help me remove a user" }
                                            ]}
                                        />
                                    </div>
                                </Container>
                            </ExampleShowcase>

                            <ExampleShowcase
                                title="EXAMPLE: LMS HELP CENTER"
                                rationale={[
                                    "Contextualized for LMS users",
                                    "Offers immediate help for common high-friction tasks (account hold)",
                                    "Guides new users on getting started"
                                ]}
                            >
                                <Container
                                    headerTitle="Help"
                                    className="h-[500px] shadow-sm"
                                    viewport="desktop"
                                >
                                    <div className="space-y-vca-lg px-4 pt-4">
                                        <Message type="disclaimer" />
                                        <Message
                                            type="ai"
                                            defaultText="Hi there. With the help of AI, I can answer questions about LinkedIn Marketing Solutions or connect you to our team."
                                        />
                                        <Message
                                            type="ai"
                                            defaultText="Not sure where to start? You can try:"
                                        />
                                        <PromptGroup
                                            prompts={[
                                                { text: "How do I remove the on hold status from my account?" },
                                                { text: "How do I start advertising on LinkedIn?" }
                                            ]}
                                        />
                                    </div>
                                </Container>
                            </ExampleShowcase>
                        </div>

                        <div className="mt-12">
                            <GuidelineGrid
                                dos={[
                                    "Mention the specific context (page, item, action).",
                                    "Keep the greeting concise and friendly.",
                                    "Provide 2-3 relevant suggested prompts."
                                ]}
                                donts={[
                                    "Start with a generic \"How can I help you?\" if context is known.",
                                    "Overwhelm the user with too many options.",
                                    "Make assumptions about user intent without offering choices."
                                ]}
                            />
                        </div>
                    </div>
                </PatternSection>
            </div>

            {/* 2. Intent Recognition */}
            <div className="border-b border-gray-200 pb-16">
                <h2 id="intent-recognition" className="scroll-mt-24 mb-4">Intent Recognition</h2>
                <p className="text-gray-600 mb-10 max-w-3xl text-lg">
                    Once the user engages, the system must accurately understand their goal. For ambiguous, high-stakes, or destructive actions, always confirm intent before proceeding.
                </p>

                <div className="space-y-16">
                    <PatternSection
                        title="Refining Intent"
                        description="Often a user's initial request is a broad goal. The AI should provide essential context—such as consequences or trade-offs—to help the user refine their intent into a specific, informed action."
                    >
                        <ExampleShowcase
                            title="EXAMPLE: DESTRUCTIVE ACTION (RECRUITER)"
                            rationale={[
                                "Proactively provides context (e.g. data loss consequences)",
                                "Offers safer alternatives before locking in intent",
                                "Ensures the user makes an informed decision"
                            ]}
                        >
                            <Container
                                headerTitle="Help"
                                className="h-[600px] shadow-sm"
                                viewport="desktop"
                            >
                                <div className="space-y-vca-lg px-4 pt-4">
                                    <Message
                                        type="user"
                                        userText="I need to remove a user from the account"
                                        className="flex justify-end"
                                    />
                                    <Message
                                        type="ai"
                                        defaultText={
                                            <div className="space-y-4">
                                                <p>
                                                    Removing a user will delete them from the dashboard and free up the license to reassign. The user will lose access to all data tied to that license (e.g. projects, saved searches).
                                                </p>
                                                <p>
                                                    This option is best for permanently offboarding users. If you'd like to preserve data access, consider instead:
                                                </p>
                                                <ul className="list-disc list-inside space-y-1 ml-1">
                                                    <li><span className="font-semibold">Reassign the license</span> — transfer data to another user.</li>
                                                    <li><span className="font-semibold">Park the license</span> — temporarily deactivate the license but preserve the data.</li>
                                                </ul>
                                                <p>How would you like to proceed?</p>
                                            </div>
                                        }
                                    />
                                    <PromptGroup
                                        prompts={[
                                            { text: "Remove a user" },
                                            { text: "Reassign a license" },
                                            { text: "Park a license" }
                                        ]}
                                    />
                                </div>
                            </Container>
                        </ExampleShowcase>
                    </PatternSection>

                    <PatternSection
                        title="Confirming Intent"
                        description="For high-stakes or inferred requests, the AI helps clarify and 'lock in' the user's intent. Explicit confirmation ensures the system acts on the correct goal before execution."
                    >
                        <ExampleShowcase
                            title="EXAMPLE: CONFIRMING INTENT (LMS)"
                            rationale={[
                                "Confirms high-stakes or specific intent before acting",
                                "Phrased as a polite closed-ended question",
                                "Offers an immediate 'out' if the AI is wrong"
                            ]}
                        >
                            <Container
                                headerTitle="Help"
                                className="h-[500px] shadow-sm"
                                viewport="desktop"
                            >
                                <div className="space-y-vca-lg px-4 pt-4">
                                    <Message
                                        type="user"
                                        userText="It looks like my ad account is on hold"
                                        className="flex justify-end"
                                    />
                                    <Message
                                        type="ai"
                                        defaultText="Just to confirm, are you looking for me to review why your Ad account is on hold?"
                                    />
                                    <PromptGroup
                                        prompts={[
                                            { text: "Yes" },
                                            { text: "No, it's something else" }
                                        ]}
                                    />
                                </div>
                            </Container>
                        </ExampleShowcase>
                    </PatternSection>

                    <PatternSection
                        title="Clarifying Ambiguity"
                        description="When a user's request is vague or could apply to multiple items, the AI should proactively ask for details rather than guessing."
                    >
                        <ExampleShowcase
                            title="EXAMPLE: AMBIGUOUS USER SEARCH"
                            rationale={[
                                "Prevents critical errors (e.g., deleting the wrong user)",
                                "Reduces typing effort by offering one-tap resolution",
                                "Builds trust by demonstrating thoroughness"
                            ]}
                        >
                            <Container
                                headerTitle="Help"
                                className="h-[500px] shadow-sm"
                                viewport="desktop"
                            >
                                <div className="space-y-vca-lg px-4 pt-4">
                                    <Message
                                        type="user"
                                        userText="Show me Sam's profile"
                                        className="flex justify-end"
                                    />
                                    <Message
                                        type="ai"
                                        defaultText="I found multiple people named 'Sam' in your organization. Which one are you looking for?"
                                    />
                                    <PromptGroup
                                        prompts={[
                                            { text: "Sam Jenkins (Engineering)" },
                                            { text: "Sam Wilson (Design)" },
                                            { text: "Samantha Jones (Sales)" }
                                        ]}
                                    />
                                </div>
                            </Container>
                        </ExampleShowcase>
                    </PatternSection>

                    <div className="mt-12">
                        <GuidelineGrid
                            dos={[
                                "Ask specific clarifying questions.",
                                "Provide explicit options when data is available.",
                                "Explain why clarification is needed (e.g., 'I found multiple...')."
                            ]}
                            donts={[
                                "Guess the most likely user without confirmation (dangerous for actions like delete).",
                                "Ask open-ended 'Who?' questions without context if you have a list.",
                                "Reprompt with generic 'I didn't understand' messages."
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* 3. Information Gathering */}
            <div className="border-b border-gray-200 pb-16">
                <h2 id="information-gathering" className="scroll-mt-24 mb-4">Information Gathering</h2>
                <p className="text-gray-600 mb-10 max-w-3xl text-lg">
                    Transform a confirmed intent into a fully specified command. Collect missing details naturally, and empower users with alternatives if they get stuck.
                </p>

                <div className="space-y-16">
                    <PatternSection
                        title="Gathering Missing Details"
                        description="When the user's intent is clear but specific parameters are missing (e.g., 'which user?'), the AI should request them naturally. It should also provide helpful context or self-serve alternatives to empower the user."
                    >
                        <ExampleShowcase
                            title="EXAMPLE: MISSING ENTITY (RECRUITER)"
                            rationale={[
                                "Friendly, direct request for the specific missing info (Name/Email)",
                                "Provides a 'step-by-step guide' link as a self-serve alternative",
                                "Maintains forward momentum without erroring out"
                            ]}
                        >
                            <Container
                                headerTitle="Help"
                                className="h-[600px] shadow-sm"
                                viewport="desktop"
                            >
                                <div className="space-y-vca-lg px-4 pt-4">
                                    <Message
                                        type="user"
                                        userText="Remove a user"
                                        className="flex justify-end"
                                    />
                                    <Message
                                        type="ai"
                                        defaultText={
                                            <div className="space-y-4 font-vca-text text-vca-small-open text-vca-text [&_p]:text-vca-small-open [&_ul]:text-vca-small-open [&_ol]:text-vca-small-open [&_li]:text-vca-small-open">
                                                <p>
                                                    No problem. Enter the <span className="font-semibold">user's name or email</span> and I'll remove them for you.
                                                </p>
                                                <p>
                                                    Or, I can <span className="text-vca-link font-semibold cursor-pointer hover:underline">guide you step-by-step</span> so you can complete it on your own.
                                                </p>
                                            </div>
                                        }
                                    />

                                </div>
                            </Container>
                        </ExampleShowcase>
                    </PatternSection>

                    <PatternSection
                        title="Prerequisite Check"
                        description="Before moving to the final action, the AI must ensure all conditions are met (e.g., permissions, business rules). Detecting blockers early saves the user from potential failure steps later."
                    >
                        <ExampleShowcase
                            title="EXAMPLE: PERMISSION DENIED (LMS)"
                            rationale={[
                                "Validates permissions immediately after intent is confirmed",
                                "Provides a clear 'Why' (lack of permissions)",
                                "Offers an actionable alternative (contact administrator)"
                            ]}
                        >
                            <Container
                                headerTitle="Help"
                                className="h-[500px] shadow-sm"
                                viewport="desktop"
                            >
                                <div className="space-y-vca-lg px-4 pt-4">
                                    <Message
                                        type="user"
                                        userText="It looks like my ad account is on hold"
                                        className="flex justify-end"
                                    />
                                    <Message
                                        type="ai"
                                        defaultText="Just to confirm, are you looking for me to review why your Ad account is on hold?"
                                    />
                                    <Message
                                        type="user"
                                        userText="Yes"
                                        className="flex justify-end"
                                    />
                                    <Message
                                        type="ai"
                                        defaultText="It looks like you don't have the necessary permissions to have a member of our team to review the rejected Ad. Please contact your administrator at [fake email] for assistance."
                                    />
                                </div>
                            </Container>
                        </ExampleShowcase>
                    </PatternSection>

                    <div className="mt-12">
                        <GuidelineGrid
                            dos={[
                                "Ask for missing information clearly and concisely.",
                                "Provide alternatives (like guide links) in case the user prefers self-service.",
                                "Check for blockers (permissions) before attempting the action."
                            ]}
                            donts={[
                                "Ask for information the system already knows.",
                                "Wait until the Action phase to tell the user they lack permissions.",
                                "Leave the user dead-ended without an alternative path."
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* 4. Action & Result */}
            <div className="border-b border-gray-200 pb-16">
                <h2 id="action-result" className="scroll-mt-24 mb-4">Action & Result</h2>
                <p className="text-gray-600 mb-10 max-w-3xl text-lg">
                    Execute the request with transparency. Use an animated 'In Progress' state for actions taking &gt;1 second, and provide clear proof of completion.
                </p>

                <PatternSection
                    title="Action Execution & Feedback"
                    description="Use the Action Status component to communicate ongoing work. For actions that take more than a few seconds, an animated 'In Progress' state assures the user that the system is working. Upon completion, transition to a 'Success' state that confirms the result and provides links to relevant records or next steps."
                >
                    <div className="space-y-16">
                        <ExampleShowcase
                            title="EXAMPLE: REMOVE USER (RECRUITER)"
                            rationale={[
                                "Confirms specific details (Name/Email) before execution",
                                "Uses animated status for transparency during processing",
                                "Provides direct link to verify results in Admin Center"
                            ]}
                        >
                            <RemovingUserExample />
                        </ExampleShowcase>
                        <div>
                            <GuidelineGrid
                                dos={[
                                    "Use the 'In Progress' state for actions taking >1 second.",
                                    "Provide a direct link to the affected record in the 'Complete' state.",
                                    "Clearly state what was done (e.g., 'User removed') rather than generic success messages."
                                ]}
                                donts={[
                                    "Leave the user guessing if the system is stuck.",
                                    "Use generic 'Success' toasts for complex actions where context matters.",
                                    "Fail silently without explaining what happened."
                                ]}
                            />
                        </div>
                    </div>
                </PatternSection>
            </div>

            {/* 5. Follow Up */}
            <div>
                <h2 id="follow-up" className="scroll-mt-24 mb-4">Follow Up</h2>
                <p className="text-gray-600 mb-10 max-w-3xl text-lg">
                    Don't just end the conversation. Proactively suggest logical next steps to keep the workflow moving.
                </p>
                <PatternSection
                    title="Proactive Suggestions"
                    description="Once a task is finished, anticipate what the user might want to do next. Use Prompts to offer one-click shortcuts to related actions, saving the user from having to type their next intent."
                >
                    <div className="space-y-16">
                        <ExampleShowcase
                            title="EXAMPLE: POST-ACTION OPTIONS"
                            rationale={[
                                "Acknowledges completion via the visible Action Status",
                                "Immediately offers relevant next steps (e.g., repeating the action)",
                                "Keeps the agent helpful and forward-looking"
                            ]}
                        >
                            <FollowUpExample />
                        </ExampleShowcase>

                        <div>
                            <GuidelineGrid
                                dos={[
                                    "Suggest relevant actions based on the task just completed.",
                                    "Keep prompts concise and action-oriented.",
                                    "Ask an open-ended question ('How else can I help?') to reset context."
                                ]}
                                donts={[
                                    "End the conversation immediately after an action.",
                                    "Suggest unrelated or random capabilities.",
                                    "Overwhelm the user with too many options (keep it to 2-3)."
                                ]}
                            />
                        </div>
                    </div>
                </PatternSection>
            </div>
        </PatternPage>
    );
};

// Animated Action Example
// Animated Example Component (from ActionPatternView)
const RemovingUserExample = () => {
    const [status, setStatus] = useState<'in-progress' | 'complete'>('in-progress');

    // Auto-replay animation
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (status === 'in-progress') {
            timeout = setTimeout(() => {
                setStatus('complete');
            }, 4000); // 4 seconds of "work"
        } else {
            timeout = setTimeout(() => {
                setStatus('in-progress');
            }, 3000); // 3 seconds of "success" before replay
        }
        return () => clearTimeout(timeout);
    }, [status]);

    return (
        <div className="flex flex-col">
            <Container
                headerTitle="Help"
                className="h-[600px] shadow-sm"
                viewport="desktop"
            >
                <div className="space-y-vca-lg px-4 pt-4">
                    <Message
                        type="ai"
                        defaultText="I've verified you have admin access to remove Alex Jenkins (ajenkins@flexis.com) from dashboard Flexis Recruiter. Do you want to continue?"
                    />

                    <div className="flex justify-end">
                        <Message
                            type="user"
                            userText="Yes, remove Alex Jenkins"
                        />
                    </div>

                    {/* Dynamic Action Status */}
                    <div className="mt-2 transition-all duration-300">
                        <ActionStatus
                            status={status}
                            title={status === 'in-progress' ? "Removing user..." : "User removed from Flexis Recruiter"}
                            description={status === 'complete' && (
                                <span>
                                    You can view the updates in the <a href="#">Users & License Management</a> tab in Admin Center.
                                </span>
                            )}
                        />
                    </div>
                </div>
            </Container>

            {/* Replay indicator */}
            <div className="text-center text-xs text-gray-400 mt-4 animate-pulse">
                {status === 'in-progress' ? 'Action in progress...' : 'Action complete. Resetting demo in 3s...'}
            </div>
        </div>
    );
};

// Example Component (from FollowUpPatternView)
const FollowUpExample = () => {
    return (
        <Container
            headerTitle="Help"
            className="h-[500px] shadow-sm"
            viewport="desktop"
        >
            <div className="space-y-vca-lg px-4 pt-4">
                {/* Previous Context: Action Completed */}
                <div className="mt-2">
                    <ActionStatus
                        status="complete"
                        title="User removed from Flexis Recruiter"
                        description={
                            <span>
                                You can view the updates in the <a href="#">Users & License Management</a> tab in Admin Center.
                            </span>
                        }
                    />
                </div>

                {/* AI Follow Up */}
                <Message
                    type="ai"
                    defaultText="How else can I help you today?"
                />

                {/* Prompts */}
                <div className="pl-12">
                    <PromptGroup
                        prompts={[
                            { text: "Remove another user" },
                            { text: "Assign available licenses" }
                        ]}
                    />
                </div>
            </div>
        </Container>
    );
};

export default ConversationFlowPatternView;
