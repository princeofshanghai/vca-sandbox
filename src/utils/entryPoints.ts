// Entry point configurations for VCA flows
// Each entry point has a product name and default prompts

export const ENTRY_POINTS = {
    'flagship': {
        productName: 'Flagship',
        defaultPrompts: [
            'What features are offered with my Premium subscription?',
            'How can I manage my Premium account?'
        ]
    },
    'admin-center': {
        productName: 'Admin Center',
        defaultPrompts: [
            'Add or remove a user',
            'Manage licenses',
            'View billing information'
        ]
    },
    'recruiter': {
        productName: 'Recruiter',
        defaultPrompts: [
            'Search for candidates',
            'Manage job postings',
            'View applicant pipeline'
        ]
    },
    'campaign-manager': {
        productName: 'Campaign Manager',
        defaultPrompts: [
            'Create a campaign',
            'View analytics',
            'Manage budget'
        ]
    },
    'sales-navigator': {
        productName: 'Sales Navigator',
        defaultPrompts: [
            'Find leads',
            'Save searches',
            'Manage account lists'
        ]
    },
    'learning': {
        productName: 'LinkedIn Learning',
        defaultPrompts: [
            'Find a course',
            'Track learning progress',
            'Get recommendations'
        ]
    }
} as const;

export type EntryPointId = keyof typeof ENTRY_POINTS;

// Helper to get entry point config
export function getEntryPointConfig(entryPointId: EntryPointId) {
    return ENTRY_POINTS[entryPointId];
}
