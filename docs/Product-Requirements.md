# VCA Sandbox — Product Requirements

**Project:** Virtual Chat Assistant (VCA) Sandbox  
**Owner:** Charles Hu, Staff Product Designer  
**Timeline:** 2 weeks  
**Version:** 1.0  
**Last Updated:** November 4, 2025

---

## Executive Summary

The VCA Sandbox MVP is a React-based web application that enables chatbot designers to view standardized VCA components and preview conversation flows without rebuilding the chat UI in Figma. The MVP focuses on two core views: a Component Library and a Flow Preview interface, with navigation built to accommodate a future Flow Builder view.

### MVP Scope
- **Component Library View:** Browse all VCA UI components organized by type
- **Flow Preview View:** Load and click through pre-defined conversation flows
- **Desktop-only:** Chat panel rendered in bottom-right corner (no mobile view)
- **Static data:** JSON-based flows with no backend or AI integration

---

## User Stories

### Primary User: Chatbot Designer

**Story 1: Component Discovery**
```
As a chatbot designer,
I want to see all available VCA components organized by type,
So that I can understand what UI elements exist and use them as a reference for my designs.
```

**Story 2: Flow Visualization**
```
As a chatbot designer,
I want to load and click through sample conversation flows,
So that I can understand how conversations progress and test realistic scenarios.
```

**Story 3: Consistent Reference**
```
As a chatbot designer,
I want to see components rendered consistently in a production-like chat panel,
So that I can use this as the source of truth for design handoffs.
```

**Story 4: Quick Navigation**
```
As a chatbot designer,
I want to easily switch between viewing components and previewing flows,
So that I can quickly move between reference and testing modes.
```

---

## Feature Specifications

### Feature 1: Top Navigation

**Description:** Tab-based navigation allowing users to switch between views.

**Tabs:**
1. 🧩 **Components** — Component Library view (active)
2. 🎭 **Flow Preview** — Flow playback view (active)
3. ✏️ **Flow Builder** — Flow creation tool (disabled, grayed out with "Coming Soon" tooltip)

**Behavior:**
- Active tab highlighted with blue underline
- Clicking tab switches main content area
- Disabled tab shows cursor:not-allowed and tooltip on hover
- Tab state persists during session (not across page reloads)

**Visual Design:**
- Fixed header at top of page
- 60px height
- White background with bottom border
- Tabs use Tailwind blue for active state

---

### Feature 2: Component Library View

**Description:** Left sidebar + main content area showing VCA components organized by type.

#### 2.1 Left Sidebar - Component List

**Layout:**
- Fixed width: 280px
- Full height (minus header)
- Light gray background (#F9FAFB)
- Scrollable if content overflows

**Component Groups:**
1. **Messages**
   - User Message Bubble
   - Assistant Message Bubble
   - System Message
   
2. **Actions**
   - Primary Button
   - Secondary Button
   - Link Button
   - Button Group
   
3. **Inputs**
   - Text Input Field
   - Dropdown Select
   - Text Area
   
4. **Feedback**
   - Typing Indicator (animated dots)
   - Loading Spinner
   - Error Message
   - Success Message
   
5. **Layout**
   - Chat Header
   - Message Container
   - Input Container
   - Scrollable Area

**Interaction:**
- Groups are always expanded (no collapse for MVP)
- Clicking component name loads it in main area
- Selected component highlighted with blue background
- Hover state shows light gray background

#### 2.2 Main Content Area - Component Display

**Layout:**
- Takes remaining horizontal space
- White background
- Padding: 40px

**Content Structure:**
```
[Component Name] (h1)
[Component Description] (paragraph)

Variants
[Show each variant side by side]

States
[Show each state vertically]
  - Default
  - Hover
  - Focus
  - Active
  - Disabled (if applicable)
  - Error (if applicable)

Usage Notes
[Guidelines from Figma]
```

**Display Format:**
- Components shown in context (e.g., message bubbles shown in a sample chat container)
- Each variant/state labeled clearly
- Background color adjusted to show component clearly (e.g., dark bg for light components)

---

### Feature 3: Flow Preview View

**Description:** Left sidebar with flow list + main area with chat panel in bottom-right corner.

#### 3.1 Left Sidebar - Flow List

**Layout:**
- Same dimensions as Component Library sidebar (280px)
- Scrollable

**Flow Categories:**
1. **Account Management**
   - Remove User
   - Add User
   - Update User Role
   
2. **Subscription & Billing**
   - Check Subscription Status
   - Upgrade Plan
   - Cancel Subscription
   
3. **Support & Help**
   - General Help
   - Report Issue
   - Request Feature

**Interaction:**
- Clicking flow name loads it in chat panel
- Selected flow highlighted with blue background
- Flow title and brief description shown
- Metadata displayed: # of messages, # of branches

#### 3.2 Main Content Area - Chat Panel

**Layout:**
- Fixed position in bottom-right corner
- Width: 400px
- Height: 600px
- Drop shadow for elevation
- Rounded corners (top-left and top-right only)

**Chat Panel Structure:**
```
┌─────────────────────────────────┐
│ [Header]                     [×]│ ← 60px height
├─────────────────────────────────┤
│                                 │
│  [Message bubbles]              │ ← Scrollable
│  [Messages appear here]         │
│                                 │
│                                 │
├─────────────────────────────────┤
│ [Input field + Send button]    │ ← 70px height
└─────────────────────────────────┘
```

**Header:**
- Title: "Help" or flow-specific title
- Close button (×) in top-right (non-functional for MVP)
- Agent name and avatar (if applicable)
- "End live chat" link (non-functional for MVP)

**Message Area:**
- Background: White
- Scrollable (auto-scroll to bottom on new message)
- Messages appear in sequence with timestamp
- User messages: Right-aligned, blue background
- Assistant messages: Left-aligned, gray background
- System messages: Centered, smaller text

**Input Area:**
- Text input field (disabled for MVP)
- Send button or attachment icon (disabled for MVP)
- Placeholder: "Ask a question..." (grayed out)

#### 3.3 Flow Interaction - Click-Through

**Behavior:**
1. Flow loads with initial messages displayed
2. When assistant message includes button options, they appear below the message
3. User clicks a button choice
4. User message appears (simulating user's selection)
5. Next assistant message appears
6. Process repeats until flow ends
7. "Restart Flow" button appears at the end

**Button Options:**
- Displayed as pill-shaped buttons below assistant message
- Blue border, white background
- Hover state: Blue background, white text
- Clicking button triggers next step in flow

**Timing:**
- No artificial delays for MVP (instant responses)
- Optional: Add 500ms delay for more realistic feel (Phase 2)

---

### Feature 4: Global Elements

#### 4.1 Page Layout
```
┌─────────────────────────────────────────┐
│  [Top Navigation Tabs]                  │ ← 60px
├────────┬────────────────────────────────┤
│        │                                │
│ Side   │    Main Content Area           │
│ bar    │                                │
│        │                                │
│ 280px  │    (Remaining width)           │
│        │                                │
└────────┴────────────────────────────────┘
```

#### 4.2 Loading States
- Initial page load: Skeleton screens for sidebar and main area
- Component switching: Fade transition (200ms)
- Flow loading: Smooth transition, maintain scroll position

#### 4.3 Empty States
- No component selected: "Select a component from the sidebar to view details"
- No flow selected: "Select a flow from the sidebar to preview"

---

## UI/UX Specifications

### Visual Design System

**Colors:**
- Primary Blue: `#3B82F6` (Tailwind blue-500)
- Text Primary: `#111827` (gray-900)
- Text Secondary: `#6B7280` (gray-500)
- Background: `#FFFFFF` (white)
- Background Secondary: `#F9FAFB` (gray-50)
- Border: `#E5E7EB` (gray-200)
- Error: `#EF4444` (red-500)
- Success: `#10B981` (green-500)

**Typography:**
- Font Family: System font stack (`font-sans` in Tailwind)
- Heading 1: 24px, font-bold
- Heading 2: 20px, font-semibold
- Body: 16px, font-normal
- Small: 14px, font-normal
- Caption: 12px, font-normal

**Spacing:**
- Base unit: 4px (Tailwind's default)
- Common spacing: 8px, 16px, 24px, 32px, 40px

**Shadows:**
- Card: `shadow-md` (0 4px 6px -1px rgba(0, 0, 0, 0.1))
- Chat panel: `shadow-lg` (0 10px 15px -3px rgba(0, 0, 0, 0.1))

**Border Radius:**
- Small: 4px (`rounded`)
- Medium: 8px (`rounded-lg`)
- Large: 12px (`rounded-xl`)
- Pills: 9999px (`rounded-full`)

### Responsive Behavior

**Desktop Only (MVP):**
- Minimum width: 1024px
- Below 1024px: Show message "Please use a larger screen (desktop only)"
- No mobile/tablet optimization for MVP

### Accessibility Requirements

**Keyboard Navigation:**
- Tab navigation through all interactive elements
- Enter/Space to activate buttons and tabs
- Arrow keys for navigating lists (sidebar items)
- Escape to close modals (Phase 2)

**Screen Reader Support:**
- Semantic HTML (`<nav>`, `<main>`, `<aside>`)
- ARIA labels on all interactive elements
- ARIA live regions for dynamic content (new messages)
- Focus indicators visible on all interactive elements

**Focus Management:**
- Clear focus indicators (blue ring)
- Focus moves logically through UI
- Focus trapped in modals (Phase 2)

---

## Success Metrics

**MVP Launch (Week 2):**
- ✅ MVP deployed and accessible to Design Pod Alpha
- ✅ All core features functional
- ✅ Zero critical bugs

**First Month:**
- 80%+ of Design Pod Alpha actively using the tool
- 5+ flows created using the sandbox
- Reduction in Figma file duplication
- Positive qualitative feedback

**First Quarter:**
- 50% reduction in time to prototype new flows
- 10+ flows in library
- Expansion to additional design teams
- Measurable improvement in design-engineering handoff quality

---

## Future Considerations (Phase 2+)

### Phase 2: Interactive Flow Testing
- Free-form text input in Flow Preview
- AI-powered or rule-based responses
- Branching logic with conditionals
- Error path handling
- Flow state persistence

### Phase 3: Flow Builder
- Form-based flow editor UI
- Add/edit/delete messages
- Define button options and branching
- Visual flow diagram view
- Export flows to JSON
- Import flows from JSON

### Phase 4: Advanced Features
- Multi-language support
- Dark mode toggle
- Component code export
- Figma sync (two-way)
- Analytics (component usage, flow completion rates)
- Collaboration features (comments, sharing)

### Phase 5: Integration
- Embed in internal design system
- Connect to production VCA data
- Engineer handoff automation
- Version control for flows
- A/B testing framework

---

## Appendix

### Glossary

- **VCA:** Virtual Chat Assistant - LinkedIn's AI-powered customer support chatbot
- **Flow:** A predefined conversation sequence with branching logic
- **Component:** A reusable UI element (button, message bubble, input field, etc.)
- **shadcn/ui:** A collection of accessible React components built with Radix UI and Tailwind
- **MCP:** Model Context Protocol - Used to integrate with Figma designs

### References

- Project Overview: `.cursor/rules/project-overview.mdc`
- Tech Guidelines: `.cursor/rules/tech-guidelines.mdc`
- Technical Specification: `docs/Technical-Specification.md`
- Development Plan: `docs/Development-Plan.md`
- Figma Library: [Link to be added]
- Production VCA: [Link to be added]

---

**Document Control:**
- **Version:** 1.0
- **Created:** November 4, 2025
- **Last Updated:** November 4, 2025
- **Next Review:** After MVP completion

