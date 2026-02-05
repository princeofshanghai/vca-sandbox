# VCA Design Tokens Reference

> **🎨 Auto-Generated System**  
> All VCA color tokens are now automatically generated from Figma exports.  
> To update: `npm run build:tokens`  
> See [Token System Guide](./Token-System-Guide.md) for details.

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

**Note:** All colors now include comprehensive hover and active states matching your Figma tokens exactly.

### Action Colors
```tsx
bg-vca-action                              // #0a66c2 (default)
bg-vca-action-hover                        // #004182
bg-vca-action-active                       // #004182
bg-vca-action-disabled                     // #0000004c
bg-vca-action-transparent-hover            // #378fe91a
bg-vca-action-transparent-active           // #378fe933
bg-vca-action-background-transparent-hover // #378fe91a (alias)
bg-vca-background-action-transparent-hover // #378fe91a (alias)
```

### Text Colors
```tsx
// Primary Text
text-vca-text                    // #000000e5 (default)
text-vca-text-hover              // #000000e5
text-vca-text-active             // #000000e5

// Meta Text
text-vca-text-meta               // #00000099
text-vca-text-meta-hover         // #000000e5
text-vca-text-meta-active        // #000000e5

// Disabled Text
text-vca-text-disabled           // #0000004c

// Negative Text
text-vca-text-negative           // #cb112d
text-vca-text-negative-hover     // #8a0015
text-vca-text-negative-active    // #640312

// Positive Text
text-vca-text-positive           // #01754f
text-vca-text-positive-hover     // #004c33
text-vca-text-positive-active    // #004c33

// Neutral Text
text-vca-text-neutral            // #56687a
text-vca-text-neutral-hover      // #38434f
text-vca-text-neutral-active     // #38434f

// Overlay Text
text-vca-text-overlay            // #ffffff
text-vca-text-overlay-hover      // #ffffff
text-vca-text-overlay-active     // #ffffff
```

### Background Colors
```tsx
// Primary Backgrounds
bg-vca-background                         // #ffffff (default)
bg-vca-background-disabled                // #8c8c8c33

// Neutral Backgrounds
bg-vca-background-neutral-soft            // #f4f2ee
bg-vca-background-neutral-strong          // #eae6df
bg-vca-background-offset                  // #f4f2ee
bg-vca-background-mobile-offset           // #eae6df

// Tint Backgrounds
bg-vca-background-tint-soft               // #e8f3ff

// Knockout Backgrounds
bg-vca-background-knockout                // #ffffff
bg-vca-background-knockout-hover          // #ffffff
bg-vca-background-knockout-active         // #ffffff99

// Overlay Backgrounds
bg-vca-background-overlay                 // #000000bf
bg-vca-background-overlay-hover           // #000000e5
bg-vca-background-overlay-active          // #000000e5

// Transparent Backgrounds
bg-vca-background-transparent             // #ffffff00
bg-vca-background-transparent-hover       // #8c8c8c19
bg-vca-background-transparent-active      // #8c8c8c33

// Semantic Backgrounds
bg-vca-background-positive-strong         // #aff4dd
bg-vca-background-positive-soft           // #d6faee
bg-vca-background-negative-strong         // #ffdee3
bg-vca-background-negative-soft           // #ffeef1
```

### Border Colors
```tsx
// Primary Border
border-vca-border                  // #000000bf (default)
border-vca-border-hover            // #000000e5
border-vca-border-active           // #000000e5
border-vca-border-disabled         // #0000004c

// Subtle Border
border-vca-border-subtle           // #0000004c
border-vca-border-subtle-hover     // #00000072
border-vca-border-subtle-active    // #00000072

// Faint Border
border-vca-border-faint            // #8c8c8c33
border-vca-border-faint-hover      // #8c8c8c4c
border-vca-border-faint-active     // #8c8c8c66

// Knockout Border
border-vca-border-knockout         // #ffffff
border-vca-border-knockout-hover   // #ffffff
```

### Surface Colors
```tsx
bg-vca-surface-tint         // #f6fbff
bg-vca-surface-tint-hover   // #e8f3ff
bg-vca-surface-tint-active  // #e8f3ff
```

### Link Colors
```tsx
// Primary Link
text-vca-link               // #0a66c2 (default)
text-vca-link-hover         // #004182
text-vca-link-active        // #004182
text-vca-link-disabled      // #0000004c

// Visited Link
text-vca-link-visited       // #8443ce
text-vca-link-visited-hover // #592099
text-vca-link-visited-active // #592099
```

### Icon Colors
```tsx
text-vca-icon                  // #000000bf (default)
text-vca-icon-disabled         // #0000004c
text-vca-icon-hover            // #000000e5
text-vca-icon-active           // #000000e5
text-vca-icon-knockout         // #ffffff
text-vca-icon-knockout-hover   // #ffffff
text-vca-icon-knockout-active  // #ffffff99
```

### Label Colors
```tsx
text-vca-label                  // #000000bf (default)
text-vca-label-disabled         // #0000004c
text-vca-label-hover            // #000000e5
text-vca-label-active           // #000000e5
text-vca-label-knockout         // #ffffff
text-vca-label-knockout-hover   // #ffffff
text-vca-label-knockout-active  // #ffffff99
```

### Status Colors
```tsx
// Negative
bg-vca-negative         // #cb112d
bg-vca-negative-hover   // #8a0015
bg-vca-negative-active  // #8a0015

// Positive
bg-vca-positive         // #01754f
bg-vca-positive-hover   // #004c33
bg-vca-positive-active  // #004c33

// Neutral
bg-vca-neutral          // #56687a
bg-vca-neutral-hover    // #38434f
bg-vca-neutral-active   // #38434f
```

### Premium Colors
```tsx
bg-vca-premium                              // #c37d16 (default)
bg-vca-premium-brand                        // #f9c982
bg-vca-premium-text-brand                   // #c37d16
bg-vca-premium-inbug                        // #c37d16
bg-vca-premium-button-background            // #f9c982
bg-vca-premium-button-background-hover      // #e9a53f
bg-vca-premium-button-background-active     // #c37d16
```

### Brand Colors
```tsx
bg-vca-brand-logo-brand  // #0a66c2
bg-vca-brand-logo-mono   // #000000
```

### Accent Colors
```tsx
bg-vca-accent         // #56687a
bg-vca-accent-hover   // #38434f
bg-vca-accent-active  // #38434f
```

### Other Colors
```tsx
bg-vca-track                   // #00000099
shadow-vca-shadow              // #0000004c
shadow-vca-shadow-supplemental // #8c8c8c33
bg-vca-white                   // #ffffff
bg-vca-spec-orange             // #ED4400
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
font-vca-text      // SF Pro Text (for body text)
font-vca-display   // SF Pro Display (for headings & large text)
```

### Body Text Styles (with line-height and weight built-in)

**Body XSmall (12px)**
```tsx
text-vca-xsmall               // 12px / 15px / 400
text-vca-xsmall-bold          // 12px / 15px / 600
text-vca-xsmall-open          // 12px / 18px / 400
text-vca-xsmall-bold-open     // 12px / 18px / 600
```

**Body Small (14px)**
```tsx
text-vca-small                // 14px / 18px / 400
text-vca-small-bold           // 14px / 18px / 600
text-vca-small-open           // 14px / 21px / 400
text-vca-small-bold-open      // 14px / 21px / 600
```

**Body Medium (16px)**
```tsx
text-vca-medium               // 16px / 20px / 400
text-vca-medium-bold          // 16px / 20px / 600
text-vca-medium-open          // 16px / 24px / 400
text-vca-medium-bold-open     // 16px / 24px / 600
```

**Body Large (20px)**
```tsx
text-vca-large                // 20px / 25px / 400
text-vca-large-bold           // 20px / 25px / 600
text-vca-large-open           // 20px / 30px / 400
text-vca-large-bold-open      // 20px / 30px / 600
```

### Heading Styles (SF Pro Text/Display, always bold)
```tsx
text-vca-heading-small        // 14px / 18px / 600 (SF Pro Text)
text-vca-heading-medium       // 16px / 20px / 600 (SF Pro Text)
text-vca-heading-large        // 20px / 25px / 600 (SF Pro Display)
text-vca-heading-xlarge       // 24px / 30px / 600 (SF Pro Display)
```

### Display Styles (SF Pro Display, for large UI text)
```tsx
text-vca-display-large        // 48px / 60px / 400
text-vca-display-large-bold   // 48px / 60px / 600
text-vca-display-xlarge       // 64px / 80px / 400
text-vca-display-xlarge-bold  // 64px / 80px / 600
```

### Usage Notes
- Body text styles use **SF Pro Text**
- Headings and Display styles use **SF Pro Display**
- "Open" variants have more line-height for better readability
- Each token includes font-size, line-height, and font-weight together

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

