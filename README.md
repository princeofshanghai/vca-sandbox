# VCA Sandbox

A comprehensive web application for designers to prototype Virtual Chat Assistant (VCA) conversation flows using production-ready UI components and a visual flow builder.

**Owner:** Charles Hu, Staff Product Designer @ LinkedIn
**Last Updated:** February 18, 2026

---

## 🎯 What Is This?

VCA Sandbox is an internal design tool that helps LinkedIn designers:
- Browse and reference standardized VCA chat components
- Build conversation flows visually without coding
- Preview flows in a realistic chat interface
- Share and collaborate on conversation designs

**See [docs/context/project-overview.md](./docs/context/project-overview.md) for a beginner-friendly introduction.**

---

## 📊 Current Status (February 2026)

### ✅ Phase 1: Component Library — COMPLETE
- 24+ production-ready VCA components
- Interactive component demos with variants and states
- Design foundations (colors, typography, spacing, radius)
- Complete design token system (70+ VCA tokens)

### ✅ Phase 2: Authentication & Dashboard — COMPLETE
- Google authentication
- User dashboard with flow management
- Create, view, and manage flows
- Protected routes and user sessions

### 🚧 Phase 3: Studio (Visual Flow Builder) — IN PROGRESS
- Node-based canvas editor (React Flow)
- Drag-and-drop flow building
- Live preview drawer with phone simulation
- Script editor and action block configuration
- Flow compilation and execution engine
- **What's left:** Polish UI, add more node types, improve UX

### 🚧 Phase 4: Sharing & Collaboration — PARTIAL
- Share routes implemented
- Supabase backend connected
- **What's left:** Complete share functionality, public URLs

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ (or 22.12+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If you deploy on Vercel, add the same two variables in Project Settings → Environment Variables for both Preview and Production.

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🏗️ Project Structure

```
vca-sandbox-6/
├── src/
│   ├── components/
│   │   ├── vca-components/      # 24+ VCA chat components
│   │   ├── component-library/   # Component demo infrastructure
│   │   ├── layout/              # App shell, navigation, sidebar
│   │   ├── dashboard/           # Dashboard and flow management
│   │   ├── ui/                  # Base UI components (shadcn/ui)
│   │   └── preview/             # Flow playback components
│   ├── views/
│   │   ├── components/          # 24 component demo views
│   │   ├── studio/              # Studio flow builder views
│   │   ├── dashboard/           # Dashboard view
│   │   ├── share/               # Share functionality
│   │   ├── auth/                # Authentication views
│   │   └── patterns/            # Pattern library views
│   ├── contexts/                # React Context (Auth, App state)
│   ├── utils/                   # Flow engine, compiler, storage
│   ├── types/                   # TypeScript definitions
│   └── config/                  # App configuration
├── docs/                        # Documentation
│   ├── context/                # Project overview and strategy
│   ├── guidelines/             # UX and visual guidelines
│   ├── proposals/              # Feature/UI proposals
│   ├── rules/                  # Legacy rule stubs
│   └── setup/                  # Setup and roadmap docs
└── public/                     # Static assets
```

---

## 🎨 Tech Stack

**Core:**
- React 18.3 + TypeScript 5.4
- Vite 7.3 (build tool)
- React Router 6 (routing)

**UI & Styling:**
- Tailwind CSS 3.4
- shadcn/ui components
- Radix UI primitives
- Custom VCA design tokens

**Flow Builder:**
- React Flow / XYFlow (node-based canvas)
- dnd-kit (drag and drop)
- elkjs (auto-layout)

**Backend:**
- Supabase (database, auth)

**Other:**
- Lucide React (icons)
- React Markdown (markdown rendering)

---

## 📚 Documentation

**Start Here:**
- [project-overview.md](./docs/context/project-overview.md) — Project goals, audience, and vision
- [shell-design-system.md](./docs/guidelines/shell-design-system.md) — Canonical shell UI guide; point Codex here for shell work
- [ui-ux-shared-context.md](./docs/context/ui-ux-shared-context.md) — Brief orientation note explaining shell UI vs VCA UI
- [sdui-strategic-alignment.md](./docs/context/sdui-strategic-alignment.md) — Long-term SDUI direction

**Guidelines:**
- [flow-preview-guidelines.md](./docs/guidelines/flow-preview-guidelines.md) — Flow preview behavior and patterns
- [visual-design.md](./docs/guidelines/visual-design.md) — High-level aesthetic note; shell guide wins on implementation details
- [tailwind-typography-fix.md](./docs/guidelines/tailwind-typography-fix.md) — Typography implementation notes

**Proposals:**
- [condition-branch-editor-redesign.md](./docs/proposals/condition-branch-editor-redesign.md) — Condition node UX proposal

**Rules:**
- [AGENTS.md](./AGENTS.md) — Active collaboration + implementation rules
- `docs/rules/*.md` are legacy stubs

**Setup Guides:**
- [share-feature-roadmap.md](./docs/setup/share-feature-roadmap.md) — Share feature logic and roadmap

---

## 🧩 VCA Components Built

All components are production-ready with variants, states, and demo pages:

**Messages & Content:**
- Message, Info Message, Action Message
- Markdown Renderer
- Container, Divider

**Interactive Elements:**
- Button, Button Icon, Button Link
- Composer (text input)
- Prompt, Prompt Group
- Action Card

**Feedback & Status:**
- Thinking Indicator
- Feedback (thumbs up/down)
- Inline Feedback
- Agent Status, Agent Timestamp

**Navigation & Structure:**
- Header
- Agent Banner
- Avatar, Badge
- Source Link, Sources

**Visual Elements:**
- VCA Icons
- Design tokens (colors, spacing, typography, radius)

---

## 🔧 Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run build:tokens # Build design tokens
```

---

## 🎯 What's Next?

**Short-term (Current Sprint):**
- Polish Studio canvas UI/UX
- Add more node types (conditions, user turns)
- Improve flow preview experience
- Complete sharing functionality

**Medium-term (Next Quarter):**
- Build library of 10-15 example flows
- Add flow export for engineering handoff
- Implement version history
- Mobile preview improvements

**Long-term (Future):**
- Collaboration features (real-time editing)
- Figma plugin integration
- AI-powered flow suggestions
- A/B testing framework

---

## 📝 Contributing

This is an internal LinkedIn tool. If you're a LinkedIn designer or engineer interested in contributing:

1. Read [project-overview.md](./docs/context/project-overview.md)
2. Review the [docs folder](./docs/) for current context, guidelines, and setup notes
3. Reach out to Charles Hu for access and guidance

---

## 🐛 Known Issues

- Studio auto-layout sometimes needs manual adjustment
- Mobile preview is still being polished on smaller screens
- Sharing currently supports public prototype links only (granular permissions are planned)
- Automated test coverage has not been added yet

---

## 📮 Contact

**Owner:** Charles Hu (Staff Product Designer)
**Team:** LinkedIn VCA Design Team
**Slack:** #vca-design (internal)

---

**Built with ❤️ for better conversation design at LinkedIn**
