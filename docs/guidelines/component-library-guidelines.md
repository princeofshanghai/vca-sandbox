# Component Library Guidelines

## Purpose
This guide explains how to safely update the Component Library sidebar for non-technical users (Designers and PMs), with clear navigation and minimal confusion.

## Source Of Truth
- Sidebar information architecture (IA) is defined in [src/config/componentNavigation.ts](/Users/chhu/cursor-projects/vca-sandbox-6/src/config/componentNavigation.ts).
- Sidebar rendering order is defined in [src/views/ComponentLibraryView.tsx](/Users/chhu/cursor-projects/vca-sandbox-6/src/views/ComponentLibraryView.tsx).

## Current Sidebar Structure
Main category order:
1. Foundations
2. Atoms
3. Components
4. Patterns

### Foundations
- Typography
- Colors
- Icons
- Spacing
- Border Radius

### Atoms
Display:
- Avatar
- Badge
- Divider
- Source Link
- Sources
- Thinking Indicator

Inputs:
- Button
- Button Icon
- Button Link
- Checkbox
- Feedback
- Inline Feedback

Live Agent:
- Agent Banner
- Agent Status
- Agent Timestamp

### Components
Actions:
- Checkbox Group
- Confirmation Card
- Prompt
- Prompt Group
- Recommendation Card
- Selection List
- Status Card

Layout:
- Composer
- Container
- Header

Messages:
- Info Message
- Message

### Patterns
- Conversation Flow
- Connecting to Live Agent

## Ordering Rules
- Main categories are manually ordered in `ComponentLibraryView.tsx`.
- Subcategories are auto-sorted A to Z in `componentNavigation.ts`.
- Items within each subcategory are auto-sorted A to Z in `componentNavigation.ts`.

## Product Decisions To Preserve
- Separate low-level building blocks (`Atoms`) from higher-level conversation blocks (`Components`).
- Keep `Avatar` and `Badge` only in `Atoms > Display` (not in `Live Agent`).
- Treat `Checkbox` as an atomic input.
- Treat `Status Card` as a higher-level component in `Components > Actions`.

## Safe Change Workflow
1. Confirm the UX intent first (who is this for: beginner or advanced users?).
2. Update IA data in `componentNavigation.ts`.
3. If main section order changes, update section render order in `ComponentLibraryView.tsx`.
4. Confirm each nav item points to an existing route in `ComponentLibraryView.tsx`.
5. Run `npm run build` to catch typing or route regressions.
6. Review sidebar on desktop and mobile.

## UX Checklist (Before Shipping)
- Happy path: New users can quickly find high-value items.
- Empty state: If search/filter is ever added, include a clear "no results" state.
- Loading state: Not needed today (static config), but document if made dynamic later.
- Error state: Missing route should fail gracefully with a usable fallback.

## Notes
- Sidebar visibility is curated. A component can still have a route even if it is not shown in the sidebar.
- Keep changes small and reversible to avoid navigation regressions.
