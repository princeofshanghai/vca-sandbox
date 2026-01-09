export const detectAgentIntent = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    const agentKeywords = [
        'agent',
        'human',
        'person',
        'someone',
        'live chat',
        'live agent',
        'speak to',
        'talk to',
        'connect me',
        'representative',
        'support person',
        'real person'
    ];
    return agentKeywords.some(keyword => lowerMessage.includes(keyword));
};

export const INITIAL_WELCOME_MESSAGES = [
    {
        stepId: 'welcome-1',
        type: 'ai-message',
        text: 'Hi there. With the help of AI, I can answer questions about Premium products or connect you to our team.',
    },
    {
        stepId: 'welcome-2',
        type: 'ai-message',
        text: 'Not sure where to start? You can try:',
        buttons: [
            { label: 'Is LinkedIn Premium right for me?', nextStep: '' },
            { label: 'How can LinkedIn Premium help me reach my goals?', nextStep: '' },
            { label: 'I need help with something on LinkedIn Premium', nextStep: '' },
        ],
    },
];
