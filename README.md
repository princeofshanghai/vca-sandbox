# VCA Sandbox

A lightweight web app for designers to prototype Virtual Chat Assistant (VCA) chatbot flows using pre-built UI components.

## Project Setup ✅

The project is initialized with:
- **React 18.3** + **TypeScript 5.4** + **Vite 5.2**
- **Tailwind CSS 3.4** configured with VCA design tokens from Figma
- **Project structure** ready for development

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
vca-sandbox-6/
├── src/
│   ├── components/
│   │   ├── layout/              # TopNavigation, Sidebar, MainContent
│   │   ├── component-library/   # Component Library view
│   │   ├── flow-preview/        # Flow Preview view
│   │   ├── vca-components/      # Custom VCA components from Figma
│   │   └── ui/                  # shadcn/ui components
│   ├── contexts/                # React Context for global state
│   ├── data/                    # JSON files for components and flows
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # App entry point
│   └── index.css                # Global styles with Tailwind
├── docs/                        # Project documentation
├── .cursor/rules/               # Cursor AI rules
└── [config files]               # Vite, TypeScript, Tailwind configs
```

## Design System

The project uses design tokens from Figma, mapped to Tailwind CSS:

### Colors
- **Action:** `#0a66c2` (LinkedIn Blue)
- **Text:** `#000000e5`
- **Background:** `#ffffff`
- **Negative:** `#cb112d`
- **Positive:** `#01754f`

### Spacing
- `xs`: 4px, `s`: 8px, `md`: 12px, `lg`: 16px, `xl`: 20px, `xxl`: 24px

### Typography
- **Font Family:** SF Pro Text / SF Pro Display
- **Sizes:** xsmall (12px), small (14px), large (20px)

### Border Radius
- `sm`: 8px, `md`: 16px, `lg`: 24px, `round`: 360px

## Development Status

### Phase 1: Project Setup ✅ COMPLETE
- [x] Initialize Vite + React + TypeScript project
- [x] Install and configure Tailwind CSS
- [x] Configure all VCA design tokens (70+ tokens with vca- prefix)
- [x] Install and configure shadcn/ui
- [x] Set up React Router
- [x] Create basic layout components (TopNavigation, Sidebar, MainContent)
- [x] Set up global context for state management
- [x] Working navigation between Components and Flow Preview views

### Next: Phase 2 - Component Library View
- Build VCA components from Figma
- Display components in Component Library
- Add component variants and states

## Documentation

- [Product Requirements](./docs/Product-Requirements.md)
- [Technical Specification](./docs/Technical-Specification.md)
- [Development Plan](./docs/Development-Plan.md)

---

**Owner:** Charles Hu, Staff Product Designer  
**Timeline:** MVP in 2 weeks

