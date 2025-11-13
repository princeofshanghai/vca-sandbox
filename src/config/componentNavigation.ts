/**
 * Component Library Navigation Configuration
 * 
 * Centralized config for sidebar navigation in Component Library view.
 * Add/remove/reorder components by editing this data structure.
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
};

export const componentNavigation: NavigationConfig = {
  // Foundations Section
  foundations: [
    { path: '/foundations/typography', label: 'Typography' },
    { path: '/foundations/colors', label: 'Colors' },
    { path: '/foundations/icons', label: 'Icons' },
    { path: '/foundations/spacing', label: 'Spacing' },
    { path: '/foundations/radius', label: 'Border Radius' },
  ],

  // Components Section (organized by category)
  components: [
    // Actions Category
    {
      label: 'Actions',
      items: [
        { path: '/components/button', label: 'Button' },
        { path: '/components/button-icon', label: 'Button Icon' },
        { path: '/components/button-link', label: 'Button Link' },
        { path: '/components/feedback', label: 'Feedback' },
        { path: '/components/prompt', label: 'Prompt' },
        { path: '/components/prompt-group', label: 'Prompt Group' },
      ],
    },
    
    // Display Category
    {
      label: 'Display',
      items: [
        { path: '/components/avatar', label: 'Avatar' },
        { path: '/components/badge', label: 'Badge' },
        { path: '/components/divider', label: 'Divider' },
        { path: '/components/agent-banner', label: 'Agent Banner' },
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
    
    // Messages Category
    {
      label: 'Messages',
      items: [
        { path: '/components/action-message', label: 'Action Message' },
        { path: '/components/agent-status', label: 'Agent Status' },
        { path: '/components/agent-timestamp', label: 'Agent Timestamp' },
        { path: '/components/info-message', label: 'Info Message' },
        { path: '/components/inline-feedback', label: 'Inline Feedback' },
        { path: '/components/message', label: 'Message' },
        { path: '/components/source-link', label: 'Source Link' },
        { path: '/components/sources', label: 'Sources' },
        { path: '/components/thinking-indicator', label: 'Thinking Indicator' },
      ],
    },
  ],
};

