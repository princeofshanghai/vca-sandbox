# 👋 Welcome to VCA Sandbox!

**New to this project? You're in the right place.**

This document explains what VCA Sandbox is, why it exists, and how to get started — no technical jargon, just the essentials.

---

## 🤔 What Is This?

**VCA Sandbox** is a design tool for creating chatbot conversations.

Think of it like:
- **Figma** for designers → but specifically for chat interfaces
- **Storyboard editor** for filmmakers → but for conversation flows
- **WYSIWYG editor** (like Google Docs) → but for chatbot dialogues

Instead of designers recreating the same chat interface over and over in Figma, they can use this tool to:
1. Browse pre-built chat components (message bubbles, buttons, etc.)
2. Build conversation flows visually
3. Preview how conversations actually feel
4. Share designs with team members for feedback

---

## 💡 Why Does This Exist?

### The Problem

At LinkedIn, we have a chatbot called **VCA (Virtual Chat Assistant)** that helps users with support questions across different products. When designers create new conversation flows (like "How do I remove a user?" or "Cancel my subscription"), they have to:

1. Rebuild the entire chat UI in Figma every single time
2. Create static mockups that don't show how the conversation actually flows
3. Hand off designs that engineers have to interpret and rebuild

This wastes time, creates inconsistencies, and makes it hard to test if the conversation actually works.

### The Solution

VCA Sandbox gives designers:
- **Pre-built components** so they never rebuild the UI from scratch
- **A visual flow builder** so they can design conversations, not just screens
- **Live preview** so they can experience conversations before building them
- **Shareable flows** so teams can review and collaborate easily

---

## 🎯 Who Is This For?

**Primary Users:**
- **Chatbot Designers** — Design conversation flows without recreating UI
- **Product Designers** — Reference standardized components for consistency

**Secondary Users:**
- **Product Managers** — Review and test conversation flows before development
- **Engineers** — Get structured flow specifications instead of static mockups
- **Researchers** — Test conversation patterns with users

---

## 📚 What Can You Do Here?

### 1️⃣ Component Library (Browse)
**Status:** ✅ Complete

See all 24+ VCA chat components organized by category:
- Messages (user, assistant, system)
- Buttons and actions
- Input fields and prompts
- Feedback elements
- Layouts and containers

Each component shows different variants, states (hover, disabled, etc.), and usage guidelines.

**Who uses this:** Designers, engineers, anyone needing reference

---

### 2️⃣ Dashboard (Manage Flows)
**Status:** ✅ Complete

Create, view, and organize your conversation flows. Like a home page where you see all your projects in one place.

**Who uses this:** Everyone who creates flows

---

### 3️⃣ Studio (Build Flows)
**Status:** 🚧 In Progress

The main event! A visual canvas where you build conversation flows by connecting nodes:

- **AI Turn Node** — What the chatbot says (messages, buttons, prompts)
- **User Turn Node** — What the user does (clicks a button, types text)
- **Condition Node** — Branching logic (if yes → go here, if no → go there)

Imagine a flowchart editor where each box is a turn in the conversation. You connect them to create the full dialogue.

**Who uses this:** Designers building conversation flows

---

### 4️⃣ Preview (Test Flows)
**Status:** 🚧 In Progress

See your conversation flow playing out in a realistic chat interface. Click through like a real user would. Test on desktop and mobile views.

**Who uses this:** Designers, PMs, researchers testing flows

---

### 5️⃣ Share (Collaborate)
**Status:** 🚧 Partial

Share flows with teammates via links so they can preview and give feedback.

**Who uses this:** Anyone sharing work for review

---

## 🚀 How Do I Use This?

### For Designers (Building Flows)

1. **Log in** — Google auth with your LinkedIn email
2. **Go to Dashboard** — Click "New Flow" to start
3. **Open Studio** — Build your conversation visually
4. **Add AI Turns** — What the chatbot says
5. **Add User Turns** — What the user does next
6. **Connect nodes** — Create the conversation flow
7. **Preview** — Test it in the chat interface
8. **Share** — Send link to teammates

### For Non-Designers (Viewing/Testing)

1. **Log in** — Google auth
2. **Dashboard** — Browse existing flows
3. **Preview** — Click through conversations to test them
4. **Give feedback** — Comment on what works/doesn't work

---

## 📂 Need More Info?

### Just Getting Started?
- Read the [README.md](../README.md) for tech setup instructions
- Check [project-overview.md](./current/project-overview.md) for goals and vision

### Building Flows?
- [studio-redesign-plan.md](./current/studio-redesign-plan.md) — How Studio works
- [vca-ui-standards.md](./current/vca-ui-standards.md) — Component guidelines

### Design Reference?
- [design-system-summary.md](./current/design-system-summary.md) — Design tokens overview
- [VCA-Design-Tokens.md](./reference/VCA-Design-Tokens.md) — Complete token reference
- [VCA_GUIDELINES.md](./reference/VCA_GUIDELINES.md) — Component usage guidelines

### Setting Things Up?
- [google-auth-setup.md](./setup/google-auth-setup.md) — Authentication setup
- [share-feature-roadmap.md](./setup/share-feature-roadmap.md) — Sharing feature implementation

### Historical Context?
- [archive/](./archive/) — Original requirements, old specs, historical docs

---

## 🎨 What's VCA?

**VCA = Virtual Chat Assistant**

It's LinkedIn's AI-powered customer support chatbot. Users across LinkedIn products (Admin Center, Recruiter, Sales Navigator, Marketing Solutions, etc.) can click a "Help" button and chat with an AI agent.

**What VCA does:**
- Answers questions about LinkedIn products
- Guides users through tasks (e.g., "How do I remove a user?")
- Escalates to human support when needed

**VCA Sandbox helps designers create better conversations for VCA.**

---

## 🛠️ Tech Stack (For Curious Folks)

Don't worry if these terms mean nothing to you — this is just for reference:

- **React + TypeScript** — Frontend framework
- **Tailwind CSS** — Styling
- **React Flow** — Node-based canvas (the flowchart editor)
- **Supabase** — Database and authentication
- **Vite** — Build tool

**Translation:** Modern web tech stack used by lots of startups and tech companies.

---

## ❓ Common Questions

### "Can I break anything?"
No! This is a sandbox environment. Play around, experiment, test things. The worst that happens is you delete a flow you created.

### "Do I need to know how to code?"
Nope! The Studio is designed for non-technical designers. You build flows visually by dragging nodes and connecting them.

### "Where does the data go?"
Flows are saved to a Supabase database. Only LinkedIn employees with access can see your flows.

### "Can I use this for other products (not VCA)?"
Right now it's built specifically for VCA components and design patterns. But the concept could extend to other chat interfaces in the future.

### "Who built this?"
Charles Hu (Staff Product Designer) built this as an internal tool for the LinkedIn VCA design team.

---

## 🐛 Something Broken?

VCA Sandbox is actively being built. If you run into issues:

1. **Check the [Known Issues](../README.md#-known-issues)** section in the README
2. **Reach out to Charles Hu** on Slack or email
3. **Join #vca-design** (internal Slack channel) for support

---

## 🎉 Ready to Start?

1. **Run the app:**
   ```bash
   npm install
   npm run dev
   ```

2. **Open in browser:**
   [http://localhost:5173](http://localhost:5173)

3. **Log in** with your LinkedIn email

4. **Explore:**
   - Browse the Component Library
   - Check out the Dashboard
   - Open Studio and start building!

---

## 📮 Questions?

**Owner:** Charles Hu (Staff Product Designer)
**Team:** LinkedIn VCA Design Team
**Slack:** #vca-design (internal)

---

**Happy building! 🚀**
