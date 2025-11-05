# VCA Sandbox — Development Plan

**Project:** Virtual Chat Assistant (VCA) Sandbox  
**Timeline:** 14 days (2 weeks)  
**Version:** 1.0  
**Last Updated:** November 4, 2025

---

## Development Breakdown

### Phase 1: Project Setup (Day 1)

**Tasks:**
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install and configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up project folder structure
- [ ] Configure TypeScript types
- [ ] Set up React Router
- [ ] Create basic layout components (TopNavigation, Sidebar, MainContent)
- [ ] Set up global context for state management

**Deliverable:** Empty app with navigation structure and routing working

---

### Phase 2: Component Library View (Days 2-4)

**Day 2: Sidebar & Data Structure**
- [ ] Create component data structure (`components.json`)
- [ ] Create ComponentList sidebar component
- [ ] Implement component group display
- [ ] Add component selection state
- [ ] Style sidebar with Tailwind

**Day 3: Component Display Area**
- [ ] Create ComponentDisplay component
- [ ] Implement component variant display
- [ ] Add state visualization (default, hover, focus, etc.)
- [ ] Create empty state
- [ ] Add component descriptions and usage notes

**Day 4: VCA Components (Initial Set)**
- [ ] Build User Message Bubble
- [ ] Build Assistant Message Bubble
- [ ] Build System Message
- [ ] Build Primary Button
- [ ] Build Secondary Button
- [ ] Build Link Button
- [ ] Build Text Input Field
- [ ] Build Typing Indicator

**Deliverable:** Functional Component Library view with 8+ components

---

### Phase 3: Flow Preview View (Days 5-8)

**Day 5: Chat Panel Structure**
- [ ] Create ChatPanel component (bottom-right positioning)
- [ ] Build ChatHeader with title and close button
- [ ] Build ChatMessage component (user/assistant variants)
- [ ] Build ChatInput component (disabled for now)
- [ ] Add scrolling behavior

**Day 6: Flow Data & Engine**
- [ ] Create flow data structure for 2-3 sample flows
- [ ] Build flow engine utility (`flowEngine.ts`)
- [ ] Implement step progression logic
- [ ] Handle button interactions
- [ ] Handle flow end states

**Day 7: Flow List & Integration**
- [ ] Create FlowList sidebar component
- [ ] Implement category grouping
- [ ] Add flow selection state
- [ ] Connect flow data to ChatPanel
- [ ] Add "Restart Flow" functionality

**Day 8: Polish & Transitions**
- [ ] Add message animations (fade in, slide up)
- [ ] Implement smooth scrolling to new messages
- [ ] Add button hover states
- [ ] Test all 3 sample flows end-to-end
- [ ] Fix any bugs

**Deliverable:** Functional Flow Preview with 3 working conversation flows

---

### Phase 4: Additional VCA Components (Days 9-10)

**Day 9: More Components**
- [ ] Build Dropdown component
- [ ] Build Loading Spinner
- [ ] Build Error Message
- [ ] Build Success Message
- [ ] Build Chat Container
- [ ] Build Message Container

**Day 10: Component Refinement**
- [ ] Add all component variants
- [ ] Document all component states
- [ ] Add usage notes for each component
- [ ] Ensure consistency across all components
- [ ] Test Component Library view with full set

**Deliverable:** Complete Component Library with 15+ components

---

### Phase 5: Polish & Testing (Days 11-12)

**Day 11: UI Polish**
- [ ] Review all spacing and alignment
- [ ] Ensure consistent colors throughout
- [ ] Add keyboard navigation support
- [ ] Improve accessibility (ARIA labels, focus states)
- [ ] Add loading states
- [ ] Test on different screen sizes (desktop only)

**Day 12: Testing & Bug Fixes**
- [ ] Test all navigation paths
- [ ] Test component switching
- [ ] Test flow interactions
- [ ] Fix any layout issues
- [ ] Optimize performance
- [ ] Add error boundaries

**Deliverable:** Production-ready MVP

---

### Phase 6: Documentation & Handoff (Days 13-14)

**Day 13: Documentation**
- [ ] Write README with setup instructions
- [ ] Document component props and usage
- [ ] Create JSON schema documentation
- [ ] Add comments to complex code
- [ ] Create troubleshooting guide

**Day 14: Prepare for Handoff**
- [ ] Create demo video/walkthrough
- [ ] Write user guide for designers
- [ ] Document how to add new components
- [ ] Document how to add new flows
- [ ] Final testing and QA

**Deliverable:** Documented, deployable MVP ready for Design Pod Alpha

---

## Acceptance Criteria

### Component Library View

**Must Have:**
- [ ] Sidebar displays all component groups
- [ ] Clicking component loads it in main area
- [ ] Components show at least 2 variants each
- [ ] Components show at least 3 states each
- [ ] Selected component is visually highlighted
- [ ] Empty state displays when nothing selected
- [ ] All components use Figma designs (via MCP)

**Nice to Have:**
- [ ] Search/filter components by name
- [ ] Copy component code snippet
- [ ] Toggle between light/dark background

---

### Flow Preview View

**Must Have:**
- [ ] Sidebar displays all flows grouped by category
- [ ] Chat panel appears in bottom-right corner
- [ ] Messages display in correct sequence
- [ ] User can click buttons to progress through flow
- [ ] Flow restarts from beginning when "Restart" is clicked
- [ ] At least 2 complete flows implemented
- [ ] Messages auto-scroll to bottom
- [ ] Typing indicator appears (even if static for MVP)

**Nice to Have:**
- [ ] Realistic message timing (500ms delays)
- [ ] "Flow completed" state with summary
- [ ] Ability to skip to specific step

---

### Navigation & Layout

**Must Have:**
- [ ] Top navigation with 3 tabs (2 active, 1 disabled)
- [ ] Active tab visually indicated
- [ ] Clicking tab switches view instantly
- [ ] Layout remains consistent across views
- [ ] Sidebar width consistent (280px)
- [ ] Responsive down to 1024px width
- [ ] "Use desktop" message below 1024px

**Nice to Have:**
- [ ] Keyboard shortcuts (1, 2, 3 for tabs)
- [ ] URL reflects current view/selection
- [ ] Browser back/forward buttons work

---

### Technical Requirements

**Must Have:**
- [ ] TypeScript with no `any` types (use `unknown` if needed)
- [ ] All components properly typed
- [ ] Tailwind for all styling (no inline styles or CSS files)
- [ ] shadcn/ui components used for navigation/layout
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] No console errors or warnings
- [ ] Fast load time (< 2 seconds)
- [ ] Smooth transitions and animations

**Nice to Have:**
- [ ] Unit tests for critical components
- [ ] Storybook for component development
- [ ] Error boundary for graceful failures

---

## Dependencies & Assumptions

### Dependencies

**External:**
- Figma designs must be complete and accessible via MCP
- Figma components must be clearly named and organized
- Design tokens (colors, spacing) aligned with Tailwind defaults

**Internal:**
- Flow JSON structure agreed upon
- Sample flow content written and approved
- Component grouping finalized

### Assumptions

**User Behavior:**
- Users have desktop computers (1024px+ width)
- Users have modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Users understand basic chat interface patterns
- Users comfortable with tab navigation

**Technical:**
- No authentication needed for MVP
- No data persistence needed (session storage okay)
- No backend API calls required
- Figma MCP integration works reliably
- Static JSON sufficient for all data

**Content:**
- 2-3 sample flows sufficient for MVP
- Flows focus on common use cases (Remove User, Check Subscription, General Help)
- Flows have clear happy paths (error handling in Phase 2)
- Component library can start with ~15 components

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Figma MCP integration issues | High | Medium | Have static Figma screenshots as backup; build components manually if needed |
| Flow logic more complex than expected | Medium | Medium | Start simple, add complexity incrementally; focus on 1-2 flows initially |
| Performance issues with many components | Low | Low | Use React.memo, lazy loading if needed; optimize after MVP |
| Scope creep (adding Phase 2 features) | High | High | Strict adherence to MVP feature list; document Phase 2 ideas separately |
| Designer feedback requires major changes | Medium | Medium | Weekly check-ins during development; share prototypes early |
| TypeScript learning curve | Low | Low | Reference documentation; use simpler types initially if needed |
| Tailwind + shadcn/ui setup complexity | Low | Medium | Follow official docs carefully; ask for help if blocked |
| Timeline slippage | Medium | Medium | Daily progress checks; cut nice-to-haves if needed |

---

## Progress Tracking

### Week 1 Milestones
- **Day 3 Checkpoint:** Component Library sidebar functional
- **Day 5 Checkpoint:** Chat panel structure complete
- **End of Week:** At least one flow working end-to-end

### Week 2 Milestones
- **Day 10 Checkpoint:** All components built and documented
- **Day 12 Checkpoint:** All bugs fixed, ready for testing
- **End of Week:** MVP deployed and accessible

### Daily Standup Questions
1. What did I complete yesterday?
2. What am I working on today?
3. Are there any blockers?

---

## Testing Checklist

### Manual Testing

**Component Library:**
- [ ] All component groups visible in sidebar
- [ ] Clicking each component loads correctly
- [ ] Variants display side-by-side
- [ ] States display vertically
- [ ] Hover states work
- [ ] Selected state highlights correctly
- [ ] Empty state shows when nothing selected

**Flow Preview:**
- [ ] All flow categories visible in sidebar
- [ ] Clicking flow loads in chat panel
- [ ] Chat panel positioned correctly (bottom-right)
- [ ] Messages appear in sequence
- [ ] Button clicks progress flow
- [ ] Scroll behavior works (auto-scroll to bottom)
- [ ] Restart flow button works
- [ ] Multiple flows can be loaded sequentially

**Navigation:**
- [ ] Tab switching works instantly
- [ ] Active tab highlighted
- [ ] Disabled tab shows tooltip
- [ ] Layout consistent across views
- [ ] Browser refresh maintains view (optional)

**Accessibility:**
- [ ] Tab key navigates through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Screen reader announces changes

**Browser Compatibility:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Screen Sizes:**
- [ ] 1920×1080 (desktop)
- [ ] 1440×900 (laptop)
- [ ] 1024×768 (minimum)
- [ ] Below 1024px shows "desktop only" message

---

## Known Limitations (MVP)

1. **No free-form text input** - Users must click buttons (Phase 2)
2. **No flow editing** - Flows are static JSON files (Phase 2)
3. **No mobile support** - Desktop only (Phase 2)
4. **No authentication** - Open access (Phase 2)
5. **No data persistence** - Resets on page refresh (acceptable for MVP)
6. **Limited flows** - Only 2-3 sample flows (expandable post-MVP)
7. **No error paths** - Flows show happy path only (Phase 2)
8. **Static typing indicator** - No animation (nice-to-have)

---

## Post-MVP Priorities

### Immediate (Week 3)
1. Gather feedback from Design Pod Alpha
2. Fix any critical bugs discovered
3. Add 2-3 more sample flows based on feedback
4. Improve performance if issues arise

### Short-term (Month 1)
1. Add free-form text input in Flow Preview
2. Implement basic search/filter in Component Library
3. Add more VCA components based on usage
4. Create video tutorial for new users

### Medium-term (Quarter 1)
1. Build Flow Builder view (Phase 3)
2. Add mobile/responsive support
3. Implement flow export/import
4. Add analytics tracking

---

## Communication Plan

### Weekly Check-ins
- **Who:** Charles (Designer) + Developer
- **When:** End of each week
- **Format:** Demo + feedback session
- **Duration:** 30 minutes

### Daily Updates
- **Format:** Async Slack message
- **Content:** Progress, blockers, next steps
- **Time:** End of day

### Final Demo
- **Who:** Design Pod Alpha team
- **When:** Day 14
- **Format:** Live walkthrough + Q&A
- **Duration:** 1 hour

---

## Success Criteria

### MVP Launch (Week 2)
- ✅ MVP deployed and accessible to Design Pod Alpha
- ✅ All core features functional
- ✅ Zero critical bugs
- ✅ Documentation complete

### Post-Launch (First Month)
- 80%+ of Design Pod Alpha actively using the tool
- 5+ flows created using the sandbox
- Reduction in Figma file duplication
- Positive qualitative feedback from designers

---

## Resources & References

- Product Requirements: `docs/Product-Requirements.md`
- Technical Specification: `docs/Technical-Specification.md`
- Project Overview: `.cursor/rules/project-overview.mdc`
- Tech Guidelines: `.cursor/rules/tech-guidelines.mdc`

---

**Document Control:**
- **Version:** 1.0
- **Created:** November 4, 2025
- **Last Updated:** November 4, 2025
- **Next Review:** Daily during development

