/**
 * Component Library Navigation Configuration
 * 
 * Centralized config for sidebar navigation in Component Library view.
 * Add/remove components by editing this data structure.
 * 
 * NOTE: Components are automatically sorted A-Z within each category.
 * Just add new components anywhere in the items array - they'll be sorted automatically!
 */

export type NavItem = {
  path: string;
  label: string;
};

export type NavSection = {
  items: NavItem[];
};

export type NavCategory = {
  label?: string; // Optional category label (e.g., "Actions", "Display")
  items: NavItem[];
};

export type NavigationConfig = {
  foundations: NavItem[];
  components: NavCategory[];
  patterns: NavItem[];
};

/**
 * Helper function to sort items alphabetically by label
 */
const sortItemsAlphabetically = (items: NavItem[]): NavItem[] => {
  return [...items].sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Helper function to sort categories and their items alphabetically
 */
const sortCategories = (categories: NavCategory[]): NavCategory[] => {
  return categories.map(category => ({
    ...category,
    items: sortItemsAlphabetically(category.items),
  }));
};

// Raw navigation data (you can add items in any order)
const rawNavigation: NavigationConfig = {
  // Foundations Section (not sorted - kept as-is)
  foundations: [
    { path: '/foundations/typography', label: 'Typography' },
    { path: '/foundations/colors', label: 'Colors' },
    { path: '/foundations/icons', label: 'Icons' },
    { path: '/foundations/spacing', label: 'Spacing' },
    { path: '/foundations/radius', label: 'Border Radius' },
  ],

  // Components Section (organized by category)
  // Add new components anywhere - they'll be auto-sorted A-Z!
  components: [
    // Display Category
    {
      label: 'Display',
      items: [
        { path: '/components/divider', label: 'Divider' },
        { path: '/components/sources', label: 'Sources' },
        { path: '/components/status-card', label: 'Status Card' },
        { path: '/components/thinking-indicator', label: 'Thinking Indicator' },
      ],
    },

    // Input Category
    {
      label: 'Input',
      items: [
        { path: '/components/button', label: 'Button' },
        { path: '/components/button-icon', label: 'Button Icon' },
        { path: '/components/button-link', label: 'Button Link' },
        { path: '/components/checkbox-group', label: 'Checkbox Group (WIP)' },
        { path: '/components/feedback', label: 'Feedback' },
        { path: '/components/inline-feedback', label: 'Inline Feedback' },
        { path: '/components/selection-list', label: 'Selection List (WIP)' },
      ],
    },

    // Layout Category
    {
      label: 'Layout',
      items: [
        { path: '/components/composer', label: 'Composer' },
        { path: '/components/container', label: 'Container' },
        { path: '/components/header', label: 'Header' },
      ],
    },

    // Actions Category
    {
      label: 'Actions',
      items: [
        { path: '/components/recommendation-card', label: 'Recommendation Card' },
        { path: '/components/prompt', label: 'Prompt' },
        { path: '/components/prompt-group', label: 'Prompt Group' },
      ],
    },

    // Live Agent Category
    {
      label: 'Live Agent',
      items: [
        { path: '/components/agent-banner', label: 'Agent Banner' },
        { path: '/components/agent-status', label: 'Agent Status' },
        { path: '/components/agent-timestamp', label: 'Agent Timestamp' },
        { path: '/components/avatar', label: 'Avatar' },
        { path: '/components/badge', label: 'Badge' },
      ],
    },

    // Messages Category
    {
      label: 'Messages',
      items: [
        { path: '/components/info-message', label: 'Info Message' },
        { path: '/components/message', label: 'Message' },
      ],
    },
  ],

  // Patterns Section (Introduction to Mental Model)
  patterns: [
    { path: '/patterns/conversation-flow', label: 'Conversation Flow' },
    { path: '/patterns/live-agent', label: 'Connecting to Live Agent' },
  ],
};

// Export sorted navigation (components auto-sorted A-Z within each category)
export const componentNavigation: NavigationConfig = {
  foundations: rawNavigation.foundations, // Foundations kept as-is
  components: sortCategories(rawNavigation.components), // Components auto-sorted
  patterns: rawNavigation.patterns, // Patterns kept as-is (ordered 1-5)
};

