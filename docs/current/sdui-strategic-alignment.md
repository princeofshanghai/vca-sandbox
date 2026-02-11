# SDUI Strategic Alignment: VCA Sandbox Future Direction

**Date:** February 5, 2026
**Author:** Charles Hu
**Status:** Strategic Planning / Discovery Phase

---

## 📋 Executive Summary (TL;DR)

**The Opportunity:**
LinkedIn's VCA is moving to **SDUI (Server-Driven UI)**, which means UI is defined in JSON and rendered dynamically by clients. VCA Sandbox already generates JSON-based flow definitions. If we align our JSON format with LinkedIn's SDUI schema, designers could author production-ready SDUI configs directly—eliminating the handoff translation layer.

**What This Means:**
- Designer builds flow in Studio → Exports SDUI JSON → Engineers deploy to production
- **Zero translation, true source of truth**
- Sandbox becomes official SDUI authoring tool for VCA

**What We Need:**
1. Access to SDUI schema documentation
2. Partnership with SDUI engineering team
3. Timeline for SDUI production readiness

**Next Steps:**
- Get SDUI schema docs (in progress)
- Map our format to SDUI spec
- Build proof-of-concept SDUI export
- Present to leadership as strategic infrastructure

---

## 🎯 What is SDUI?

### Definition
**SDUI = Server-Driven UI**

An architectural pattern where:
- **Server defines the UI** (components, layout, data, logic)
- **Clients render it dynamically** (Android, iOS, Web)
- **No app releases needed** for UI changes

### How It Works

**Traditional Approach:**
```javascript
// Hardcoded in mobile app
function RemoveUserFlow() {
  return (
    <Message>I can help you remove a user</Message>
    <Button onClick={handleYes}>Yes</Button>
    <Button onClick={handleNo}>No</Button>
  );
}
```

**SDUI Approach:**
```json
// Server sends JSON config
{
  "screen_id": "remove_user_flow",
  "components": [
    {
      "type": "message",
      "variant": "ai",
      "text": "I can help you remove a user"
    },
    {
      "type": "button",
      "text": "Yes",
      "action": "confirm_remove"
    },
    {
      "type": "button",
      "text": "No",
      "action": "cancel_remove"
    }
  ]
}
```

Client receives JSON → Interprets schema → Renders UI

### Why Companies Use SDUI

**Benefits:**
- ✅ **Ship UI changes without app releases** (faster iteration)
- ✅ **Personalize experiences** (different UI for different users)
- ✅ **A/B test easily** (server controls what users see)
- ✅ **Cross-platform consistency** (one JSON, all platforms render it)
- ✅ **Reduce app binary size** (less hardcoded UI)

**Trade-offs:**
- ⚠️ Requires robust schema and versioning
- ⚠️ Client renderer must handle all component types
- ⚠️ Debugging is harder (UI defined remotely)

---

## 🔗 Why SDUI Matters for VCA Sandbox

### LinkedIn's VCA is Moving to SDUI

**Current State:**
- **Ember VCA stack** — In production but deprecated (maintenance mode)
- **SDUI** — Being built now, the future of VCA

**What This Means:**
- All VCA conversation flows will eventually be SDUI configs
- UI changes will be server-driven, not hardcoded
- Conversation logic will be defined in JSON

### VCA Sandbox Already Does This!

**Our Current Architecture:**
```typescript
// Our flow format (from types.ts)
interface Turn {
  id: string;
  type: 'turn';
  speaker: 'ai';
  components: Component[];  // ← Array of UI components
}

interface Component {
  id: string;
  type: 'message' | 'infoMessage' | 'actionCard' | 'buttons';
  content: {...};  // ← Component props/config
}
```

**This is already an SDUI schema!**

Our Studio:
1. Designers build flows visually
2. Studio generates JSON (components + logic)
3. Preview interprets JSON and renders UI

**This is exactly what SDUI does.**

---

## 💎 The Strategic Opportunity

### Vision: VCA Sandbox as SDUI Authoring Tool

**The Big Picture:**

```
┌─────────────────────────────────────────────────────────┐
│ Designer Uses Studio                                     │
│ • Drag components onto canvas                           │
│ • Configure props visually                              │
│ • Build conversation flow                               │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Export SDUI JSON                                         │
│ {                                                        │
│   "flow_id": "remove_user",                             │
│   "steps": [...],                                       │
│   "components": [...],                                  │
│   "logic": [...]                                        │
│ }                                                        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Engineer Deploys to SDUI Server                          │
│ • No rebuilding components                              │
│ • No translation layer                                  │
│ • Designer's JSON = Production config                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ LinkedIn VCA Clients Render                              │
│ • Android app fetches JSON                              │
│ • iOS app fetches JSON                                  │
│ • Web app fetches JSON                                  │
│ • All render the same conversation                      │
└─────────────────────────────────────────────────────────┘
```

### What This Unlocks

**For Designers:**
- ✅ Build flows that ship directly to production
- ✅ No "lost in translation" bugs
- ✅ Iterate on live flows without waiting for engineers
- ✅ True "design is the spec" workflow

**For Engineers:**
- ✅ Receive production-ready SDUI configs
- ✅ No rebuilding UI from mockups
- ✅ Focus on backend logic, not UI implementation
- ✅ Designer changes don't require code reviews

**For Product:**
- ✅ Ship conversation changes faster
- ✅ A/B test flows easily (just swap JSON)
- ✅ Personalize per user segment
- ✅ Reduce dependency on engineering for UI tweaks

**For Leadership:**
- ✅ Faster time to market for VCA improvements
- ✅ Designer empowerment (self-service flow creation)
- ✅ Strategic investment in LinkedIn's SDUI infrastructure
- ✅ Positions design as enabler, not bottleneck

---

## 📊 Current State vs. Future State

### Current State (Today)

**How VCA Flows are Built:**
1. Designer creates mockups in Figma
2. Designer hands off to engineer
3. Engineer interprets mockups
4. Engineer hardcodes UI in app
5. Engineer tests and debugs
6. PR review, merge, deploy
7. **Timeline: 1-2 weeks per flow**

**Problems:**
- ❌ Translation errors (designer intent ≠ implementation)
- ❌ Slow iteration (every change needs engineering)
- ❌ Inconsistency across platforms
- ❌ Designers can't test real flows

### Future State (SDUI Aligned)

**How VCA Flows Could Be Built:**
1. Designer builds flow in VCA Sandbox Studio
2. Designer tests flow in realistic preview
3. Designer exports SDUI JSON
4. Engineer deploys JSON to SDUI server
5. **Timeline: 1-2 days per flow**

**Benefits:**
- ✅ Zero translation (JSON is the implementation)
- ✅ Fast iteration (designer-driven)
- ✅ Guaranteed consistency (one JSON, all platforms)
- ✅ Designers test with real components

---

## 🚧 Blockers & How to Get Unblocked

### Blocker 1: Don't Have SDUI Schema Yet

**What We Need:**
- SDUI JSON schema documentation
- Component registry (available components + props)
- Example SDUI configs for VCA flows

**How to Unblock:**
- ✅ Follow up with VCA engineering (in progress)
- Request schema docs
- Ask for sample SDUI JSON
- Get intro to SDUI team

**Status:** Waiting on response from engineering

---

### Blocker 2: SDUI Not Production Ready

**Current Situation:**
- SDUI is being built, not yet integrated
- Timeline unclear (could be months)
- Ember is still in production (but deprecated)

**Options:**

**Option A: Wait for SDUI**
- Keep custom components
- Build adoption with current approach
- Transition when SDUI is ready
- **Timeline: 6-12 months**

**Option B: Integrate Ember Short-Term**
- Get pixel-perfect preview now
- Migrate to SDUI later
- Double integration work
- **Timeline: 3 months + migration**

**Option C: SDUI-First Strategy (Recommended)**
- Align JSON format with SDUI schema now
- Use SDUI as north star
- Build renderer when SDUI is ready
- **Timeline: Immediate prep, 6-12 month payoff**

**Recommendation: Option C**
- Start alignment work now
- Don't waste effort on Ember
- Be ready when SDUI launches

---

### Blocker 3: Don't Know If Our Format Matches SDUI

**What We Need:**
- Compare our current flow JSON to SDUI schema
- Identify gaps and differences
- Understand what needs to change

**How to Unblock:**
1. Get SDUI schema (blocker 1)
2. Document our current format
3. Create mapping/gap analysis
4. Prototype SDUI export function

**Next Steps:**
- Create `flow-schema-comparison.md` document
- Map Component types to SDUI component types
- Identify what's missing or incompatible

---

### Blocker 4: Need Engineering Partnership

**Current Situation:**
- This is a solo project (Charles building it)
- SDUI integration requires eng support
- Need buy-in from VCA engineering team

**How to Unblock:**
- Present strategic vision to VCA engineering
- Show proof-of-concept SDUI export
- Request dedicated eng support (even 20% time)
- Position as solving SDUI authoring problem

**Talking Points:**
- "SDUI needs authoring tooling—hand-writing JSON doesn't scale"
- "We already have 80% of an SDUI editor built"
- "Small investment to align with SDUI = huge designer productivity gains"

---

### Blocker 5: Need Leadership Buy-In

**Current Situation:**
- This is a design-led initiative
- Becoming strategic infrastructure requires leadership support
- Need resourcing commitment

**How to Unblock:**
- Build adoption first (prove designer value)
- Show SDUI alignment as strategic opportunity
- Frame as "designer empowerment" + "faster shipping"
- Request investment at right inflection point

**When to Pitch Leadership:**
- After 10+ designers are actively using it
- After SDUI schema alignment is proven
- When SDUI production timeline is clearer

---

## 🗓️ Action Plan

### Short-term (Next 2-4 Weeks)

**Goals:**
- Get SDUI schema documentation
- Understand component definitions
- Map our format to SDUI

**Actions:**
- [ ] Follow up with VCA engineering (Slack sent)
- [ ] Review SDUI schema when received
- [ ] Document our current flow JSON format
- [ ] Create gap analysis document
- [ ] Build simple proof-of-concept SDUI export

**Deliverables:**
- `flow-schema-comparison.md` — Gap analysis
- Prototype SDUI export function
- Presentation for VCA eng team

---

### Medium-term (1-3 Months)

**Goals:**
- Align Studio export with SDUI schema
- Build partnership with SDUI team
- Increase designer adoption

**Actions:**
- [ ] Update Studio to export SDUI-compliant JSON
- [ ] Connect with SDUI engineering team
- [ ] Test SDUI export with engineering
- [ ] Onboard 5-10 designers to Studio
- [ ] Collect feedback on what's missing

**Deliverables:**
- SDUI export feature in Studio
- 10+ production-quality example flows
- Partnership established with SDUI team

---

### Long-term (3-12 Months)

**Goals:**
- Integrate SDUI renderer for pixel-perfect preview
- Position as official SDUI authoring tool
- Scale to 50+ active designer users

**Actions:**
- [ ] Integrate SDUI client renderer in preview
- [ ] Build production deployment pipeline
- [ ] Create training materials for designers
- [ ] Pitch to leadership as strategic investment
- [ ] Expand to other LinkedIn chat interfaces

**Deliverables:**
- Production-grade SDUI authoring platform
- Designer self-service flow creation
- Measurable impact on shipping velocity

---

## 💬 How to Communicate This

### To Your Manager

**Framing:**
> "I've been building a tool for designers to prototype VCA flows faster. I just learned that LinkedIn's VCA is moving to SDUI—which is JSON-driven UI.
>
> The tool I built already generates JSON-based flow definitions. If we align our format with LinkedIn's SDUI schema, designers could author production-ready SDUI configs directly.
>
> This could transform the tool from a design prototype tool into strategic infrastructure that accelerates how we ship VCA improvements.
>
> **Ask:** Can I spend the next month exploring SDUI alignment with engineering? If the fit is good, this could be a significant productivity unlock."

**Key Points:**
- Strategic alignment with LinkedIn's technical direction
- Transforms a design tool into production infrastructure
- Accelerates shipping velocity for VCA
- Designer empowerment (self-service flow creation)

---

### To VCA Engineering

**Framing:**
> "I'm building a visual Studio for VCA flow creation. Designers build flows on a canvas, and it exports JSON definitions.
>
> I just learned about the SDUI direction and realized our formats might align. If we match your SDUI schema, designers could author production configs visually instead of hand-writing JSON.
>
> **Ask:** Can I see the SDUI schema to explore alignment? If the fit is good, we could partner to build the official SDUI authoring tool."

**Key Points:**
- Solving the "how do we author SDUI configs?" problem
- Reduces engineering burden (no rebuilding from mockups)
- Visual tooling scales better than manual JSON editing
- Already 80% built, just needs alignment

---

### To Leadership (When Ready)

**Framing:**
> "VCA Sandbox started as a design productivity tool—helping designers prototype conversation flows faster than Figma.
>
> But LinkedIn's VCA is moving to SDUI (Server-Driven UI), which means conversations will be defined in JSON. We've now aligned the Sandbox export format with the SDUI schema.
>
> **This means designers can now author production-ready SDUI configs directly.**
>
> Impact:
> • Designers ship flow changes independently (no engineering bottleneck)
> • 10x faster iteration on VCA conversations
> • Zero translation layer (design output = production config)
> • Positions design as enabler, not blocker
>
> **Ask:** Investment in engineering support to complete SDUI integration and scale to all designers working on VCA."

**Key Points:**
- Started as design tool, evolved into strategic infrastructure
- Measurable impact on shipping velocity
- Designer empowerment narrative
- Positions design as technical leader

---

## ❓ Open Questions

### Technical Questions
- [ ] What exactly is the SDUI JSON schema?
- [ ] How close is our current format to SDUI spec?
- [ ] What components are supported in SDUI?
- [ ] How does SDUI handle branching/conditional logic?
- [ ] Is there a TypeScript SDK for SDUI schemas?
- [ ] What does the SDUI client renderer look like?

### Timeline Questions
- [ ] When will SDUI be production-ready for VCA?
- [ ] What's the migration timeline from Ember to SDUI?
- [ ] How long to align our format with SDUI schema?
- [ ] When should we pitch this to leadership?

### Partnership Questions
- [ ] Who's leading SDUI development?
- [ ] Is there appetite for a visual SDUI authoring tool?
- [ ] Can we get dedicated eng support for integration?
- [ ] How do we ensure our tool stays in sync with SDUI updates?

### Adoption Questions
- [ ] How do we get more designers using the tool?
- [ ] What training/documentation is needed?
- [ ] How do we measure success/impact?
- [ ] What's the rollout strategy?

---

## 📚 Resources & Next Steps

### Documents to Create
1. **Flow Schema Comparison** — Map our format to SDUI schema
2. **SDUI Export Spec** — Document the export format
3. **Integration Proposal** — Present to engineering
4. **Leadership Pitch Deck** — When ready to scale

### People to Connect With
- **VCA Engineering** — Get SDUI schema (in progress)
- **SDUI Team** — Understand component library
- **Design Leadership** — Get buy-in for strategic direction
- **Product Managers** — Understand VCA roadmap

### Immediate Next Steps
1. ✅ Send Slack follow-up to VCA engineering (done)
2. ⏳ Wait for SDUI schema documentation
3. ⏳ Document our current flow JSON format
4. ⏳ Create gap analysis when schema received
5. ⏳ Build proof-of-concept SDUI export

---

## 🎯 Success Metrics

### Phase 1: Validation (3 months)
- [ ] SDUI schema alignment proven feasible
- [ ] 10+ designers actively using Studio
- [ ] 20+ production-quality flows created
- [ ] Engineering validation that export format works

### Phase 2: Integration (6 months)
- [ ] SDUI renderer integrated (pixel-perfect preview)
- [ ] 50+ designers onboarded
- [ ] 5+ flows deployed to production via SDUI export
- [ ] Measurable reduction in design → production time

### Phase 3: Scale (12 months)
- [ ] Official SDUI authoring tool for VCA
- [ ] 100+ active designers
- [ ] 50% of VCA flows created in Studio
- [ ] Engineering team uses Studio exports as source of truth

---

## 🔥 Why This Matters

**Bottom Line:**

We accidentally built the right architecture (JSON-driven flows) before knowing about SDUI. Now that SDUI is LinkedIn's future, we're uniquely positioned to become the authoring layer.

**This could transform:**
- A design tool → Strategic infrastructure
- A side project → Official platform
- Design as bottleneck → Design as enabler

**The opportunity window is now.** SDUI is being built, authoring tooling is needed, and we already have 80% of the solution.

---

**Last Updated:** February 5, 2026
**Next Review:** After receiving SDUI schema documentation
**Owner:** Charles Hu
**Stakeholders:** VCA Engineering, Design Leadership, Product
