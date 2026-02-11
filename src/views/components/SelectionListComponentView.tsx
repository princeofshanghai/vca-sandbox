import { useState } from 'react';
import { SelectionList, SelectionItem } from '@/components/vca-components/selection-list';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons } from '@/components/component-library/DemoControls';
import { ExampleShowcase } from '@/views/patterns/components/ExampleShowcase';
import { Message } from '@/components/vca-components/messages';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { Container } from '@/components/vca-components/container/Container';

const mockUsers: SelectionItem[] = [
    {
        id: '1',
        title: 'Sarah Jenkins',
        subtitle: 'sarah.j@example.com',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
        id: '2',
        title: 'Michael Chen',
        subtitle: 'm.chen@example.com',
        imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
        id: '3',
        title: 'Emily Davis',
        subtitle: 'edavis@example.com',
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
        id: '4',
        title: 'David Wilson',
        subtitle: 'dwilson@example.com',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
];

const mockAccounts: SelectionItem[] = [
    { id: 'a1', title: 'Acme Corp', subtitle: 'ID: 8839201', iconName: 'building' },
    { id: 'a2', title: 'Globex Inc', subtitle: 'ID: 4492011', iconName: 'building' },
    { id: 'a3', title: 'Soylent Corp', subtitle: 'ID: 1102934', iconName: 'building' },
    { id: 'a4', title: 'Initech', subtitle: 'ID: 5592011', iconName: 'building' },
];

const mockLicenses: SelectionItem[] = [
    { id: 'l1', title: 'Enterprise Seat 2024', subtitle: 'Expires Dec 31' },
    { id: 'l2', title: 'Pro Seat 2024', subtitle: 'Expires Nov 15' },
    { id: 'l3', title: 'Basic Seat', subtitle: 'Monthly' },
];

// Generate many users for "Show More" demo
const manyUsers: SelectionItem[] = Array.from({ length: 12 }, (_, i) => ({
    id: `many-${i}`,
    title: `User Candidate ${i + 1}`,
    subtitle: `candidate.${i + 1}@example.com`,
    imageUrl: `https://i.pravatar.cc/150?u=${i}`
}));

const SelectionListComponentView = () => {
    const [layout, setLayout] = useState<'list' | 'carousel' | 'grid'>('list');
    const [dataType, setDataType] = useState<'users' | 'accounts' | 'licenses'>('users');

    // Demo State for "Realistic Usage"
    const [userDemoState, setUserDemoState] = useState<'selecting' | 'selected'>('selecting');
    const [selectedUser, setSelectedUser] = useState<SelectionItem | null>(null);

    const handleUserSelect = (item: SelectionItem) => {
        setUserDemoState('selected');
        setSelectedUser(item);
    };

    const resetUserDemo = () => {
        setUserDemoState('selecting');
        setSelectedUser(null);
    };

    const getItems = () => {
        switch (dataType) {
            case 'users': return mockUsers;
            case 'accounts': return mockAccounts;
            case 'licenses': return mockLicenses;
            default: return mockUsers;
        }
    };

    return (
        <ComponentViewLayout
            title="Selection List (WIP)"
            description="A flexible component for selecting items from a list, such as users, accounts, or licenses. Supports multiple layouts."
        >
            <div className="space-y-20">
                <DemoSection
                    controls={
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <ToggleButtons
                                label="Layout"
                                options={['list', 'carousel', 'grid'] as const}
                                value={layout}
                                onChange={setLayout}
                            />
                            <ToggleButtons
                                label="Data Type"
                                options={['users', 'accounts', 'licenses'] as const}
                                value={dataType}
                                onChange={setDataType}
                            />
                        </div>
                    }
                >
                    <div className="p-4 bg-gray-50 rounded-xl w-full flex justify-center">
                        <SelectionList
                            items={getItems()}
                            layout={layout}
                            onSelect={(item) => alert(`Selected: ${item.title}`)}
                        />
                    </div>
                </DemoSection>

                <div className="space-y-12">
                    <div>
                        <h2>Usage</h2>
                        <p className="mt-4 text-gray-600">
                            Use the Selection List when you need the user to choose one item from a collection.
                            It adapts to different content types (people with avatars, accounts with icons) and display contexts.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Layouts</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                <li><strong>List:</strong> Best for 3-5 items where clarity is key. Vertical stack.</li>
                                <li><strong>Carousel:</strong> Good for preserving vertical space or showing 5+ items. Horizontal scroll.</li>
                                <li><strong>Grid:</strong> specific use cases where you want a compact 2-column view.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Realistic Usage Demo */}
            <div className="space-y-8">
                <div>
                    <h2>Realistic Usage</h2>
                    <p className="mt-4 text-gray-600">
                        Here's how the Selection List appears within a typical VCA conversation flow.
                    </p>
                </div>

                <div className="flex flex-col gap-12 max-w-[1000px] mx-auto">

                    {/* Example 2: Realistic Usage */}
                    <ExampleShowcase title="User Selection Flow">
                        <Container
                            headerTitle="Help"
                            className="h-[600px] mx-auto shadow-sm"
                            viewport="desktop"
                            composerStatus="default"
                            composerValue=""
                        >
                            <div className="flex flex-col gap-vca-lg">
                                <Message
                                    variant="user"
                                    userText="Remove user 'Sarah'"
                                    className="flex justify-end"
                                />

                                <Message
                                    variant="ai"
                                    defaultText="I can help with that. Which user would you like to remove?"
                                />

                                {/* The Selection Component */}
                                {userDemoState === 'selecting' ? (
                                    <>
                                        <SelectionList
                                            items={mockUsers.slice(0, 3)}
                                            layout="list"
                                            onSelect={handleUserSelect}
                                        />
                                        <PromptGroup
                                            prompts={[
                                                { text: "Search by email instead" },
                                                { text: "Cancel" }
                                            ]}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Message
                                            variant="user"
                                            userText={selectedUser?.title || "Selected User"}
                                            className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300"
                                        />
                                        <Message
                                            variant="ai"
                                            defaultText={`Okay, I've removed ${selectedUser?.title} from the project.`}
                                            className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150"
                                        />
                                        <button
                                            onClick={resetUserDemo}
                                            className="text-xs text-gray-400 hover:text-gray-600 underline mt-4"
                                        >
                                            Reset Demo
                                        </button>
                                    </>
                                )}
                            </div>
                        </Container>
                    </ExampleShowcase>

                    {/* Example 2: Account Selection (Carousel) */}
                    <ExampleShowcase title="Account Selection (Carousel)">
                        <Container
                            headerTitle="Help"
                            className="h-[600px] mx-auto"
                            viewport="desktop"
                            composerStatus="default"
                            composerValue=""
                        >
                            <div className="flex flex-col gap-vca-lg">
                                <Message
                                    variant="user"
                                    userText="Check my account status"
                                    className="flex justify-end"
                                />

                                <Message
                                    variant="ai"
                                    defaultText="I found multiple accounts associated with your profile. Which one would you like to check?"
                                />

                                {/* The Selection Component */}
                                <div className="-mx-vca-xl px-vca-xl overflow-hidden">
                                    {/* Negative margin to breakout of container padding, but keeping px for start alignment */}
                                    <SelectionList
                                        items={mockAccounts}
                                        layout="carousel"
                                        onSelect={(item) => alert(`Selected ${item.title}`)}
                                    />
                                </div>

                                <Message
                                    variant="ai"
                                    defaultText="Or you can search for a different account below."
                                />
                            </div>
                        </Container>
                    </ExampleShowcase>

                    {/* Example 3: Long List (Show More) */}
                    <ExampleShowcase title="Long List (Show More)">
                        <Container
                            headerTitle="Help"
                            className="h-[600px] mx-auto shadow-sm"
                            viewport="desktop"
                            composerStatus="default"
                            composerValue=""
                        >
                            <div className="flex flex-col gap-vca-lg">
                                <Message
                                    variant="user"
                                    userText="Search for 'Alex'"
                                    className="flex justify-end"
                                />

                                <Message
                                    variant="ai"
                                    defaultText="I found 12 people matching 'Alex'. Here are the top results:"
                                />

                                {/* The Selection Component with maxDisplayed */}
                                <SelectionList
                                    items={manyUsers}
                                    layout="list"
                                    maxDisplayed={3}
                                    onSelect={(item) => alert(`Selected ${item.title}`)}
                                />

                                <Message
                                    variant="ai"
                                    defaultText="If you don't see who you're looking for, try refining your search."
                                />
                            </div>
                        </Container>
                    </ExampleShowcase>
                </div>
            </div>
        </ComponentViewLayout >
    );
};

export default SelectionListComponentView;
