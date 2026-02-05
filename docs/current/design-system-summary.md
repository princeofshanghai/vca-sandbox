# VCA Sandbox Design Principles & System

This document captures the "Aesthetic" and "Technical Stack" of the VCA Sandbox to ensure future UI development remains consistent with the current look and feel.

## 1. Aesthetic Philosophy: "Modern Industrial SaaS"

The VCA Sandbox follows a **Minimalist, Content-First** design language often seen in modern developer tools (like Linear, Vercel, or Figma). It prioritizes clarity over decoration.

### Key Characteristics
-   **Compact & Dense**: Information is high-density but legible. We use smaller text sizes (`text-xs`, `text-sm`) to fit more context without clutter.
-   **Structure via Whitespace**: We avoid heavy borders. Instead, we use subtle background shifts (e.g., White `bg-white` vs. Off-White `bg-gray-50`) to define sections.
-   **"Cinematic" Contexts**: For immersive tasks (like the Share View or Studio), we switch to a precision-engineered Dark Mode (`#1E1E1E`, `#2C2C2C`) that feels like a professional creative suite.
-   **Functional Color**: Color is reserved for actions (Blue buttons) or status indicators. It is not used for decoration.

---

## 2. Technical Component Stack

You are not building from scratch. You are using a modern, industry-standard stack known as the "**Shadcn Stack**".

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Styling Engine** | **Tailwind CSS** | Utility-first CSS. We use classes like `flex`, `p-4`, `text-gray-500` directly in the markup. |
| **Component Library** | **Shadcn UI** | A collection of re-usable components (Buttons, Inputs, Dropdowns) located in `src/components/ui`. These are accessible and unstyled by default, but pre-styled with Tailwind. |
| **Icons** | **Lucide React** | The icon set used (e.g., `<Trash2 />`, `<Plus />`). Consistent, clean line strokes. |
| **Animation** | **Framer Motion** & **CSS** | Used for smooth transitions (e.g., hover states, drawer slides). |

---

## 3. Core Color Palette

### Light Mode (Dashboard, General UI)
-   **Backgrounds**: `bg-white` (Cards/Main), `bg-gray-50` (App Background/Sidebar).
-   **Text**: `text-gray-900` (Headings), `text-gray-700` (Body), `text-gray-500` (Muted/Metadata).
-   **Borders**: `border-gray-200` (Subtle dividers), `border-transparent` (Clean look).
-   **Action**: `bg-blue-600` (Primary Buttons), `hover:bg-blue-700`.

### Dark Mode (Studio / Share View)
-   **Canvas Background**: `#1E1E1E` (Deep charcoal, softer than pure black).
-   **Panel Background**: `#2C2C2C` (Lighter charcoal for headers/sidebars to create depth).
-   **Accent**: `#0D99FF` (Vibrant Blue for primary actions/selection).
-   **Text**: `text-white` (Primary), `text-gray-400` (Secondary).

---

## 4. Common Layout Patterns

When building new views, follow these structural patterns:

### A. The "Dashboard" Layout
*Used in: DashboardView.tsx*
1.  **Container**: `flex h-full bg-white overflow-hidden`
2.  **Sidebar**: Fixed width, border-right.
3.  **Main Content**: `flex-1`, `flex-col`, `overflow-y-auto`. Content is centered with a `max-w-7xl mx-auto` constraint to maintain readability on large screens.

### B. The "Studio" Layout (Immersive)
*Used in: StudioView.tsx*
1.  **Container**: `h-screen overflow-hidden flex-col bg-white` (No scroll on body).
2.  **Panels**: Floating absolute positioned panels (e.g., Toolbar, Settings) over a pan/zoom canvas.
3.  **Drawers**: Slide-over panels (Shadcn `Sheet` or custom variants) for detailed editing.

### C. The "Cinematic" Layout
*Used in: ShareView.tsx*
1.  **Container**: `h-screen bg-[#1E1E1E] flex flex-col`.
2.  **Header**: Minimal, dark (`bg-[#2C2C2C]`), focused on the title and essential actions.
3.  **Stage**: `flex-1 flex items-center justify-center` to put the content (preview) directly in the spotlight.

---

## 5. Reusable Components Cheatsheet
(Located in `src/components/ui` or `src/components/layout`)

-   **`Button`**: Detailed variants (`default`, `ghost`, `outline`, `destructive`).
-   **`Input` / `Textarea`**: Standard form fields with focus rings.
-   **`Sidebar`**: The navigation wrapper for the app.
-   **`FlowCard`**: The specific card component for displaying projects/chats.
-   **`VcaLogo`**: The branding mark.
