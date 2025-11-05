# VCA Design Tokens Reference

All VCA-specific design tokens from Figma have been added to Tailwind with the `vca-` prefix.

---

## How to Use

### **App Shell (Use Standard Tailwind)**
For navigation, sidebars, and general app UI:
```tsx
<div className="bg-white text-gray-900 border-gray-200">
  <button className="bg-blue-500 hover:bg-blue-600">
    Standard Button
  </button>
</div>
```

### **VCA Components (Use vca-* Tokens)**
For chat bubbles, messages, and VCA-specific UI:
```tsx
<div className="bg-vca-background text-vca-text border-vca-border">
  <button className="bg-vca-action hover:bg-vca-action-hover text-vca-label-knockout px-vca-lg py-vca-s rounded-vca-sm">
    VCA Button
  </button>
</div>
```

---

## Colors

### Action Colors
```tsx
bg-vca-action              // #0a66c2 (default)
bg-vca-action-hover        // #004182
bg-vca-action-active       // #004182
bg-vca-action-transparent-hover    // #378fe91a
bg-vca-action-transparent-active   // #378fe933
```

### Text Colors
```tsx
text-vca-text              // #000000e5 (default)
text-vca-text-meta         // #00000099
text-vca-text-disabled     // #0000004d
text-vca-text-negative     // #cb112d
text-vca-text-positive     // #01754f
text-vca-text-neutral      // #56687a
text-vca-text-overlay      // #ffffff
```

### Background Colors
```tsx
bg-vca-background                    // #ffffff (default)
bg-vca-background-disabled           // #8c8c8c33
bg-vca-background-neutral-soft       // #f4f2ee
bg-vca-background-tint-soft          // #e8f3ff
bg-vca-background-knockout           // #ffffff
bg-vca-background-overlay            // #000000bf
bg-vca-background-overlay-hover      // #000000e5
bg-vca-background-overlay-active     // #000000e5
bg-vca-background-transparent-hover  // #8c8c8c1a
bg-vca-background-transparent-active // #8c8c8c33
```

### Border Colors
```tsx
border-vca-border          // #000000bf (default)
border-vca-border-subtle   // #0000004d
border-vca-border-faint    // #8c8c8c33
border-vca-border-active   // #000000e5
border-vca-border-hover    // #000000e5
```

### Surface Colors
```tsx
bg-vca-surface-tint        // #f6fbff
bg-vca-surface-tint-active // #e8f3ff
```

### Link Colors
```tsx
text-vca-link              // #0a66c2 (default)
text-vca-link-hover        // #004182
text-vca-link-active       // #004182
text-vca-link-visited      // #8443ce
text-vca-link-disabled     // #0000004d
```

### Icon Colors
```tsx
text-vca-icon                  // #000000bf (default)
text-vca-icon-disabled         // #0000004d
text-vca-icon-hover            // #000000e5
text-vca-icon-active           // #000000e5
text-vca-icon-knockout         // #ffffff
text-vca-icon-knockout-hover   // #ffffff
text-vca-icon-knockout-active  // #ffffff99
```

### Label Colors
```tsx
text-vca-label                  // #000000bf (default)
text-vca-label-disabled         // #0000004d
text-vca-label-hover            // #000000e5
text-vca-label-active           // #000000e5
text-vca-label-knockout         // #ffffff
text-vca-label-knockout-hover   // #ffffff
text-vca-label-knockout-active  // #ffffff99
```

### Status Colors
```tsx
text-vca-negative          // #cb112d
text-vca-positive          // #01754f
text-vca-neutral           // #56687a
```

### Other Colors
```tsx
bg-vca-premium             // #c37d16
bg-vca-accent              // #56687a
bg-vca-track               // #00000099
shadow-vca-shadow          // #0000004d
shadow-vca-shadow-supplemental // #8c8c8c33
bg-vca-white               // #ffffff
bg-vca-spec-orange         // #ED4400
```

---

## Spacing

```tsx
p-vca-none    // 0
p-vca-xs      // 4px
p-vca-s       // 8px
p-vca-md      // 12px
p-vca-lg      // 16px
p-vca-xl      // 20px
p-vca-xxl     // 24px

// Also works with: m-, gap-, space-, etc.
```

---

## Border Radius

```tsx
rounded-vca-none   // 0
rounded-vca-sm     // 8px
rounded-vca-md     // 16px
rounded-vca-lg     // 24px
rounded-vca-round  // 360px (full circle)
```

---

## Typography

### Font Families
```tsx
font-vca-text      // SF Pro Text
font-vca-display   // SF Pro Display
```

### Text Sizes (with line-height and weight built-in)
```tsx
text-vca-xsmall               // 12px / 15px / 400
text-vca-xsmall-bold          // 12px / 15px / 600
text-vca-xsmall-open          // 12px / 18px / 400
text-vca-xsmall-bold-open     // 12px / 18px / 600
text-vca-small                // 14px / 18px / 400
text-vca-small-bold           // 14px / 18px / 600
text-vca-small-open           // 14px / 21px / 400
text-vca-small-bold-open      // 14px / 21px / 600
text-vca-large                // 20px / 25px / 600
text-vca-display-large        // 48px / 60px / 600
```

---

## Shadows

```tsx
shadow-vca         // Standard VCA shadow
shadow-vca-lg      // Larger VCA shadow (for chat panel)
```

---

## Example Component

```tsx
const MessageBubble = ({ message }: { message: string }) => {
  return (
    <div className="bg-vca-background border border-vca-border rounded-vca-md p-vca-md shadow-vca">
      <p className="text-vca-small text-vca-text font-vca-text">
        {message}
      </p>
      <button className="mt-vca-s bg-vca-action hover:bg-vca-action-hover text-vca-label-knockout px-vca-lg py-vca-s rounded-vca-sm text-vca-small">
        Click me
      </button>
    </div>
  );
};
```

---

## Notes

- **ALL Tailwind defaults are still available** (blue-500, gray-900, p-4, rounded-lg, etc.)
- **Use standard Tailwind for app shell** (navigation, sidebar, layout)
- **Use vca-* tokens for chat components** (message bubbles, buttons, etc.)
- **VCA tokens match your Figma variables exactly**

