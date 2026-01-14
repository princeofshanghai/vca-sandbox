import { useState, useEffect } from 'react';
import { PatternPage, PatternSection, GuidelineGrid, ExampleShowcase } from './components';
import { Message } from '@/components/vca-components/messages';
import { ActionStatus } from '@/components/vca-components/action-status/ActionStatus';
import { Container } from '@/components/vca-components/container/Container';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';


const ConversationFlowPatternView = () => {
    return (
        <PatternPage
            title="Conversation Flow"
            description="Great conversations feel natural, not robotic. By following this standard flow—Welcome, Intent Recognition, Info Gathering, and Action—we ensure every interaction feels helpful, consistent, and human."
            relatedComponents={[
                { label: 'Message', path: '/components/message' },
                { label: 'Prompt Group', path: '/components/prompt-group' },
                { label: 'Action Status', path: '/components/action-status' },
                { label: 'Container', path: '/components/container' }
            ]}
        >
            {/* 0. Designing the Conversation */}
            <div className="border-b border-gray-200 pb-16">
                <h2 id="the-conversation-lifecycle" className="scroll-mt-24 mb-4">Designing the Conversation</h2>
                <p className="text-gray-600 mb-10 max-w-3xl text-lg">
                    Designing for AI doesn't mean reinventing the wheel. At its core, a good chat interaction follows a reliable structure—similar to a traditional user flow, but more flexible. Use this 5-step framework to map out your experience.
                </p>

                <div className="space-y-12">
                    {/* Visual Process Map */}
                    <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                        <div className="hidden md:grid grid-cols-7 gap-4">
                            <ProcessStep
                                number="01"
                                title="Welcome"
                                icon="👋"
                                desc="Establish context"
                            />
                            <div className="flex items-center justify-center text-gray-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </div>
                            <ProcessStep
                                number="02"
                                title="Intent"
                                icon="🤔"
                                desc="Confirm request"
                            />
                            <div className="flex items-center justify-center text-gray-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </div>
                            <ProcessStep
                                number="03"
                                title="Info"
                                icon="📝"
                                desc="Collect details"
                            />
                            <div className="flex items-center justify-center text-gray-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </div>
                            <ProcessStep
                                number="04"
                                title="Action"
                                icon="⚡️"
                                desc="Execute & Follow up"
                            />
                        </div>
                        {/* Mobile View / Fallback text list */}
                        <div className="md:hidden space-y-4">
                            <div className="flex items-center gap-3"><span className="font-mono text-gray-400">01</span> <span className="font-semibold">Welcome</span></div>
                            <div className="flex items-center gap-3"><span className="font-mono text-gray-400">02</span> <span className="font-semibold">Intent Recognition</span></div>
                            <div className="flex items-center gap-3"><span className="font-mono text-gray-400">03</span> <span className="font-semibold">Info Gathering</span></div>
                            <div className="flex items-center gap-3"><span className="font-mono text-gray-400">04</span> <span className="font-semibold">Action</span></div>
                        </div>
                    </div>

                    {/* Core Principles Block */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">Core Design Principles</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <div className="text-blue-600 mb-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h4 className="font-semibold text-vca-text mb-2">Establish Context</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Don't ask questions the system already understands. Use the user's current page and permissions to skip the basics.
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <div className="text-blue-600 mb-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                </div>
                                <h4 className="font-semibold text-vca-text mb-2">Clarify Early</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Vague requests lead to errors. If there's doubt, ask a quick multiple-choice question to zero in on the goal.
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <div className="text-blue-600 mb-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h4 className="font-semibold text-vca-text mb-2">Provide Feedback</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Silence is scary. Chat interfaces need clear "working" and "success" states to build trust during tasks.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/* 1. Welcome */}
            <div className="border-b border-gray-200 pb-16">
                <h2 id="welcome" className="scroll-mt-24 mb-4">Welcome</h2>
                <p className="text-gray-600 mb-10 max-w-3xl text-lg">
                    Make a great first impression. Acknowledge where the user is and offer relevant help immediately.
                </p>

                <PatternSection
                    title="Start with Context"
                    description="Don't start with a blank slate. Use what you know about the user's current page or recent actions to offer a tailored greeting."
                >
                    <div className="space-y-16">
                        <div className="space-y-8">
                            <ExampleShowcase
                                title="EXAMPLE: RECRUITER HELP CENTER"
                                rationale={[
                                    "Acknowledges the product context (Recruiter).",
                                    "Clearly states how it can help.",
                                    "Offers specific shortcuts (Prompts) to get started."
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
                                    "Contextualized for LMS users.",
                                    "Addresses the highest-friction pain point immediately (account hold).",
                                    "Guides new users on where to begin."
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
                                    "Be specific. Mention the page or item they're looking at.",
                                    "Keep it friendly and short.",
                                    "Offer 2-3 relevant prompts to help them get moving."
                                ]}
                                donts={[
                                    "Don't be generic (e.g., 'How can I help?') when you know where they are.",
                                    "Don't overwhelm them with too many choices.",
                                    "Don't guess what they want without offering options."
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
                    Understand what they need. If their request is vague, dangerous, or high-stakes, clarify it before taking action.
                </p>

                <div className="space-y-16">
                    <PatternSection
                        title="Refining Intent"
                        description="Sometimes users start broad. Help them narrow it down by explaining the consequences or trade-offs of their request."
                    >
                        <ExampleShowcase
                            title="EXAMPLE: DESTRUCTIVE ACTION (RECRUITER)"
                            rationale={[
                                "Warns about data loss before it happens.",
                                "Suggests safer alternatives (Reassign/Park).",
                                "Lets the user make the final call."
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
                        description="For risky or sensitive actions, measure twice, cut once. Ask a simple query to ensure you're solving the right problem."
                    >
                        <ExampleShowcase
                            title="EXAMPLE: CONFIRMING INTENT (LMS)"
                            rationale={[
                                "Validates the request before diving in.",
                                "Uses a simple Closed Question (Yes/No).",
                                "Gives them an easy way to say 'No'."
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
                        description="Don't guess. If a request could mean multiple things (like two people named 'Sam'), ask for clarification."
                    >
                        <ExampleShowcase
                            title="EXAMPLE: AMBIGUOUS USER SEARCH"
                            rationale={[
                                "Prevents errors (like deleting the wrong Sam).",
                                "Makes it easy to resolve with one click.",
                                "Builds trust by being thorough."
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
                                "Ask specific follow-ups to narrow things down.",
                                "Give explicit options whenever possible.",
                                "Explain *why* you're asking (e.g., 'I found two Sams...')."
                            ]}
                            donts={[
                                "Don't guess (especially for destructive actions).",
                                "Don't ask open-ended questions if you have the list already.",
                                "Don't just say 'I don't understand.' Be helpful."
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* 3. Info Gathering */}
            <div className="border-b border-gray-200 pb-16">
                <h2 id="info-gathering" className="scroll-mt-24 mb-4">Info Gathering</h2>
                <p className="text-gray-600 mb-10 max-w-3xl text-lg">
                    Get the details. Ask for what's missing naturally, and check for blockers early so users don't waste time.
                </p>

                <div className="space-y-16">
                    <PatternSection
                        title="Fill in the Blanks"
                        description="If you know *what* they want but not *who* or *when*, just ask. And always offer a way for them to do it themselves if they prefer."
                    >
                        <ExampleShowcase
                            title="EXAMPLE: MISSING ENTITY (RECRUITER)"
                            rationale={[
                                "Friendly request for the missing info.",
                                "Offers a self-serve guide as a backup.",
                                "Keeps the conversation moving forward."
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
                        title="Check Before You Start"
                        description="Don't let them go through the whole process just to fail at the end. Check for permissions or rules right away."
                    >
                        <ExampleShowcase
                            title="EXAMPLE: PERMISSION DENIED (LMS)"
                            rationale={[
                                "Checks permissions immediately.",
                                "Explains exactly why it can't be done.",
                                "Tells them who to contact to fix it."
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
                                "Ask clearly for the missing piece of info.",
                                "Offer self-serve alternatives (like guide links).",
                                "Check for permission blockers immediately."
                            ]}
                            donts={[
                                "Don't ask for things you already know.",
                                "Don't wait until the end to say 'Access Denied'.",
                                "Don't leave them stuck without a next step."
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* 4. Action */}
            <div>
                <h2 id="action" className="scroll-mt-24 mb-4">Action</h2>
                <p className="text-gray-600 mb-10 max-w-3xl text-lg">
                    Do the work confidently. Keep the user in the loop, verify the result, and proactively suggest what comes next.
                </p>

                <div className="space-y-16">
                    <PatternSection
                        title="Transparency & Feedback"
                        description="If it takes more than a second, show them you're working on it. When finished, confirm it clearly and link them to the result."
                    >
                        <div className="space-y-16">
                            <ExampleShowcase
                                title="EXAMPLE: REMOVE USER (RECRUITER)"
                                rationale={[
                                    "Confirms details before executing.",
                                    "Shows 'In Progress' so they know it's working.",
                                    "Links directly to the record so they can verify."
                                ]}
                            >
                                <RemovingUserExample />
                            </ExampleShowcase>
                            <div>
                                <GuidelineGrid
                                    dos={[
                                        "Use 'In Progress' states for longer actions.",
                                        "Link to the 'Complete' record whenever possible.",
                                        "Say exactly what was done (e.g., 'User removed')."
                                    ]}
                                    donts={[
                                        "Don't leave them guessing if it froze.",
                                        "Don't use generic 'Success' messages if you can be specific.",
                                        "Don't fail silently."
                                    ]}
                                />
                            </div>
                        </div>
                    </PatternSection>

                    <PatternSection
                        title="Proactive Suggestions"
                        description="The job isn't done until they're ready to move on. Suggest the next logical step so they don't have to type it out."
                    >
                        <div className="space-y-16">
                            <ExampleShowcase
                                title="EXAMPLE: POST-ACTION OPTIONS"
                                rationale={[
                                    "Acknowledges the action is done.",
                                    "Suggests logical next steps (like doing it again).",
                                    "Asks 'How else can I help?' to reset the flow."
                                ]}
                            >
                                <FollowUpExample />
                            </ExampleShowcase>

                            <div>
                                <GuidelineGrid
                                    dos={[
                                        "Suggest relevant next steps.",
                                        "Keep prompts short and actionable.",
                                        "Reset the context with an open-ended question."
                                    ]}
                                    donts={[
                                        "Don't cut the conversation dead.",
                                        "Don't suggest random, unrelated things.",
                                        "Don't offer too many options."
                                    ]}
                                />
                            </div>
                        </div>
                    </PatternSection>

                    <PatternSection
                        title="Handling Capability Limits"
                        description="Be honest when the AI can't do something. Don't just apologize—offer a self-serve alternative so the user isn't stuck."
                    >
                        <div className="space-y-16">
                            <ExampleShowcase
                                title="EXAMPLE: GUIDANCE OVER ACTION (RECRUITER)"
                                rationale={[
                                    "Admits limitation clearly but politely.",
                                    "Provide the 'How-To' steps immediately in chat.",
                                    "Links to the official documentation for verification."
                                ]}
                            >
                                <ParkingLicenseExample />
                            </ExampleShowcase>

                            <div>
                                <GuidelineGrid
                                    dos={[
                                        "Say 'I can't do that yet, but here is how you can...'",
                                        "Provide the steps directly in the chat window.",
                                        "Link to the source article."
                                    ]}
                                    donts={[
                                        "Don't just say 'I can't do that'.",
                                        "Don't make them search for the help article themselves.",
                                        "Don't promise actions you can't deliver."
                                    ]}
                                />
                            </div>
                        </div>
                    </PatternSection>
                </div>
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
                <div>
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

// Example Component (from User Request)
const ParkingLicenseExample = () => {
    return (
        <Container
            headerTitle="Help"
            className="h-[600px] shadow-sm"
            viewport="desktop"
        >
            <div className="space-y-vca-lg px-4 pt-4">
                <Message
                    type="user"
                    userText="Park a license"
                    className="flex justify-end"
                />

                <Message
                    type="ai"
                    defaultText="While I'm not able to park a license for you right now, here's an easy guide to help you do it yourself."
                />

                <InfoMessage
                    title="To park a license in LinkedIn Recruiter, follow these steps:"
                    message={
                        <div className="space-y-4 font-vca-text text-vca-small-open text-vca-text [&_p]:text-vca-small-open [&_ul]:text-vca-small-open [&_ol]:text-vca-small-open [&_li]:text-vca-small-open">
                            <ol className="list-decimal list-outside ml-4 space-y-2">
                                <li><span className="font-semibold">Sign in to Recruiter.</span></li>
                                <li>
                                    <span className="font-semibold">Access the Admin Center:</span> Move your cursor over your profile picture at the top of your Recruiter homepage and select <span className="font-semibold">Manage users in Admin Center</span> from the dropdown.
                                </li>
                                <li>
                                    <span className="font-semibold">Locate the User:</span> In the Users tab, find the user whose license you want to park. You can filter by license type, status, or search by name/email.
                                </li>
                                <li>
                                    <span className="font-semibold">Park the License:</span> Click the <span className="font-semibold">More</span> icon next to the user and select <span className="font-semibold">Park</span> from the dropdown.
                                </li>
                            </ol>
                            <p className="font-semibold">
                                Important Note: The number of times a license can be parked is limited and varies by contract. For example, if your organization has 15 seats, you can park 15 licenses every 30 days.
                            </p>
                            <p>
                                For more detailed guidance, you can refer to the <a href="#" className="font-bold text-vca-link hover:underline">LinkedIn Help Center article on managing licenses.</a>
                            </p>
                        </div>
                    }
                    showSources={true}
                    sources={[
                        { text: "Remove or park a license in LinkedIn Admin Center for Recruiter", href: "#" },
                        { text: "Actions admins can take to manage user licenses in Recruiter", href: "#" }
                    ]}
                    showRating={true}
                />
            </div>
        </Container>
    );
};

export default ConversationFlowPatternView;

interface ProcessStepProps {
    number: string;
    title: string;
    icon: string;
    desc: string;
}

const ProcessStep = ({ number, title, icon, desc }: ProcessStepProps) => (
    <div className="flex flex-col items-center text-center group">
        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl mb-3 shadow-sm group-hover:border-blue-300 group-hover:shadow-md transition-all">
            {icon}
        </div>
        <div className="text-xs font-mono text-gray-400 font-medium mb-1">{number}</div>
        <div className="font-semibold text-vca-text text-sm mb-1">{title}</div>
        <div className="text-xs text-gray-500 leading-tight px-2">{desc}</div>
    </div>
);

