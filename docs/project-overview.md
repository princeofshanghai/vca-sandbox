# VCA sandbox — Project Overview

**Owner:** Charles Hu, Staff Product Designer, LinkedIn  
**Project Type:** Internal Design Tool

---

## What is VCA sandbox?

A web app where designers can easily prototype conversation flows using standardized components.

---

## Background: What is VCA?

VCA (Virtual Chat Assistant) is LinkedIn's AI-powered customer support chat feature. Across LinkedIn products (Ex. Admin Center, Sales Navigator, Recruiter, etc.) users can access help through a chat interface where an AI agent answers their questions. If the AI can't help, users can escalate to a human support agent.

This sandbox helps designers create better conversation flows for VCA.

---

## The Problem We're Solving

Designers currently recreate the same chat UI in Figma for every new conversation flow they design (like "Remove User," "Cancel Subscription," etc.). This creates a few major issues:

1. **Wasted time** — Designers waste time redrawing screens instead of focusing on the conversation itself
2. **Inconsistency** — Designers sometimes use slightly different versions of components and interaction patterns, leading to confusion and quality issues
3. **Hard to test** — Static Figma mockups make it difficult to experience how a conversation actually flows and identify problems before engineering handoff

---

## Who It's For

**Primary Users:** Chatbot designers at LinkedIn

**Secondary Users:** Product managers and engineers at LinkedIn who need to review conversation flows

This is an internal tool built for LinkedIn employees working on the Virtual Chat Assistant (VCA) product.

---

## Jobs To Be Done (JTBD)

**When I'm designing a new chatbot flow:**  
I want to quickly prototype conversation sequences using existing UI components so I can focus on the conversation logic instead of redrawing the same interface over and over.

**When I'm testing a conversation design:**  
I want to click through the flow in a realistic chat environment so I can experience how the dialogue actually feels and catch UX issues before engineering handoff.

**When I'm handing off designs to engineering:**  
I want to provide structured flow documentation (not just static mockups) so engineers understand the exact conversation logic and can implement it accurately.

**When I'm iterating on a flow:**  
I want to quickly edit conversation steps and see changes immediately so I can experiment with different approaches and refine the experience faster.

**When I'm exploring edge cases:**  
I want to test different conversation paths and states so I can identify gaps in the flow early and ensure we handle all user scenarios gracefully.

---

## Core Features (Phased Approach)

### **Phase 1: Component Library** 
Browse all VCA chat components (buttons, message bubbles, inputs, etc.) in one organized reference. Includes design foundations like typography, colors, spacing, and icons.

**Status:** Single source of truth established. Designers no longer need to recreate components from scratch.

### **Phase 2: Flow Preview** 
Test conversation flows in a realistic chat interface. Click through dialogues to see how conversations actually play out before eng hand-off.

**What's working:**
- Plays pre-built conversation flows
- Shows messages, buttons, agent handoffs with realistic timing
- View flows on desktop and mobile layouts

**Next steps:**
- Build library of common flow patterns (10-15 examples)
- Add JSON code view for transparency
- Enable flow sharing via downloadable files

### **Phase 3: Playground** 
Visual editor to create and modify conversation flows without writing code. Edit conversations directly in the chat interface.

**Key capabilities:**
- **Inline editing** — Click any message or button to edit it in place
- **Add/remove steps** — Build conversation logic visually
- **Auto-save** — Changes save automatically as you work
- **Export to JSON** — Download files for engineering handoff
- **Simple version history** — Restore previous versions of flows

### **Phase 4: Advanced Features** 
- **Shareable links** — Share flows via URL for easy viewing/feedback
- **Version control** — Track changes over time with timestamps
- **Collaboration** — Multiple designers working together (exploratory)

---

## Our Goals

### Current Goal
Enable designers to test conversation flows in a realistic environment before engineering handoff, reducing back-and-forth and catching UX issues early.

### Success Looks Like
- ✅ Designers have access to accurate, up-to-date component library
- 🚧 Designers can preview and share conversation flows for feedback
- 🔮 Designers can create new flows independently without recreating UI
- 🔮 Engineering receives structured, implementable conversation flows

### Long-term Vision
Create a self-service tool where designers can prototype, test, and refine chatbot conversations end-to-end. Flows created in the sandbox become the handoff documentation for engineering—no more static Figma mockups.

---

## Why This Matters

Better conversation design = happier users interacting with our chatbot.

When designers can iterate faster and test more thoroughly, we ship higher-quality experiences that actually solve customer problems instead of frustrating them. We reduce time and effort used to design new experiences.

