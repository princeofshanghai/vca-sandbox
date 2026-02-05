# VCA Token System Guide

## 🎨 Overview

Your VCA design system now uses a **proper token reference system** where:
- **Primitives** = Base colors (e.g., `blue-70`, `black-a90`) with actual hex values
- **Semantic tokens** = Design tokens (e.g., `action`, `text`) that reference primitives
- **Tailwind config** = Auto-generated from Figma tokens with all references resolved

## 🏗️ Architecture

```
Figma Design
    ↓
tokens3.json (exported from Figma via Tokens Studio plugin)
    ↓
scripts/build-tokens.js (resolves all references)
    ↓
src/design-tokens.js (generated Tailwind-compatible tokens)
    ↓
tailwind.config.js (imports and uses the tokens)
    ↓
Your Components (use VCA color classes)
```

## 📁 File Structure

```
/docs
  └── tokens3.json              # Export from Figma (Tokens Studio plugin)
  └── Token-System-Guide.md     # This guide

/scripts
  └── build-tokens.js            # Token resolution script

/src
  └── design-tokens.js           # AUTO-GENERATED - Do not edit!
  
tailwind.config.js               # Imports design-tokens.js
```

## 🚀 How to Use

### 1. Export Tokens from Figma

When you make changes to colors in Figma:

1. Open your Figma file
2. Use the **Tokens Studio plugin** 
3. Export tokens to JSON
4. Save as `docs/tokens3.json`

### 2. Regenerate Design Tokens

Run the build script:

```bash
npm run build:tokens
```

This will:
- ✅ Parse `tokens3.json`
- ✅ Extract primitives (base colors)
- ✅ Extract semantic tokens
- ✅ Resolve all references (e.g., `{color.blue.blue-70}` → `#0a66c2`)
- ✅ Generate `src/design-tokens.js`

### 3. Use in Components

Your components automatically use the updated tokens through Tailwind:

```tsx
// All these classes automatically use the latest tokens
<div className="bg-vca-action hover:bg-vca-action-hover">
  <p className="text-vca-text">Hello</p>
</div>
```

## 🎯 Benefits

### ✅ Single Source of Truth
- Figma is the source of truth
- All colors reference primitives
- Change a primitive → all semantic tokens update automatically

### ✅ Type Safety
- Tailwind will catch typos in color names
- IntelliSense shows available colors

### ✅ Maintainability
- No manual hex value updates
- Consistent naming across design and code
- Easy to add new colors

### ✅ Scalability
- Supports color modes/themes
- Easy to add dark mode in future
- Structured and organized

## 📊 Current Token Count

- **VCA Color Categories:** 22
- **Total Color Tokens:** 112
- **Token Structure:** Primitives → Semantic → Tailwind

## 🔄 Workflow

### Regular Updates (When Figma Changes)

```bash
# 1. Export tokens3.json from Figma
# 2. Run the build script
npm run build:tokens

# 3. Test your components
npm run dev
```

### Adding New Colors

1. Add primitive colors in Figma (e.g., `blue-85`)
2. Create semantic tokens that reference primitives (e.g., `action.color-action-focus → {color.blue.blue-85}`)
3. Export to `tokens3.json`
4. Run `npm run build:tokens`
5. Use in components: `bg-vca-action-focus`

## 🎨 Color Categories

Your system includes these VCA color categories:

### Core Colors
- `vca-action` - Primary action colors (buttons, links)
- `vca-text` - Text colors with all variants
- `vca-background` - Background and surface colors
- `vca-border` - Border colors with states

### Interactive States
- `vca-link` - Link colors including visited states
- `vca-icon` - Icon colors with knockout variants
- `vca-label` - Label colors for buttons

### Semantic Colors
- `vca-positive` - Success/positive states
- `vca-negative` - Error/negative states  
- `vca-neutral` - Neutral states

### Special Colors
- `vca-premium` - Premium feature colors
- `vca-brand` - Brand/logo colors
- `vca-accent` - Accent colors
- `vca-surface` - Surface tint colors
- `vca-shadow` - Shadow colors
- `vca-track` - Track/progress colors

## 🛠️ Technical Details

### Token Resolution

The script resolves references like:

```json
// Input (tokens3.json)
{
  "primitives-mode-1": {
    "color": {
      "blue": {
        "blue-70": { "value": "#0a66c2ff" }
      }
    }
  },
  "tokens-mode-1": {
    "action": {
      "color-action": {
        "value": "{color.blue.blue-70}"
      }
    }
  }
}

// Output (design-tokens.js)
{
  "vca-action": {
    "DEFAULT": "#0a66c2"
  }
}
```

### Hex Normalization

The script automatically:
- Removes `ff` alpha channel from fully opaque colors
- Converts `#0a66c2ff` → `#0a66c2`
- Preserves alpha for transparent colors

### Naming Convention

Tokens are mapped to VCA naming:
- `action.color-action` → `vca-action`
- `action.color-action-hover` → `vca-action-hover`
- `text.color-text-meta` → `vca-text-meta`

## ⚠️ Important Notes

### Do Not Edit
- **NEVER edit** `src/design-tokens.js` manually
- It will be overwritten on next build

### Keep in Sync
- Always export from Figma before making changes
- Run `build:tokens` after updating `tokens3.json`
- Test your components after regenerating

### Version Control
- ✅ Commit `tokens3.json` (source of truth)
- ✅ Commit `design-tokens.js` (for other developers)
- ✅ Commit `build-tokens.js` (the build script)

## 🎓 For Designers

**What this means for you:**

1. **Design in Figma** - Create and update colors using primitives
2. **Export tokens** - Use Tokens Studio plugin to export JSON
3. **Share with devs** - Give them the `tokens3.json` file
4. **They run one command** - `npm run build:tokens`
5. **Magic!** ✨ - All components update automatically

**No more:**
- Manual hex value updates
- Designer → Developer handoffs with spreadsheets
- "What's the exact hex for that blue?"
- Inconsistencies between design and code

## 🎉 Success!

You now have a professional-grade design token system that:
- Matches your Figma exactly
- Updates automatically
- Scales with your project
- Follows industry best practices

**Next time you update colors in Figma:** Just export, run `npm run build:tokens`, and you're done! 🚀

