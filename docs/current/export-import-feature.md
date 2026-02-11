# Export & Import JSON Feature

**Added:** February 5, 2026
**Location:** Studio Canvas Toolbar
**Status:** ✅ Implemented

---

## 🎯 What It Does

Allows designers to export flows as JSON files and import them back, enabling:
- **Backup flows** locally
- **Share flows** via file (not just URL)
- **Version control** flows (Git, Dropbox, etc.)
- **Template library** (save reusable flows)
- **SDUI alignment** (export format ready for SDUI schema mapping)

---

## 📍 Location

**Studio Canvas → Top Right Toolbar**

```
┌────────────────────────────────────────────┐
│ [Back] Flow Name    [📄] │ [▶️] [Share]   │
│                     ↑                      │
│                  NEW FILE MENU             │
└────────────────────────────────────────────┘
```

The **File icon** (📄 FileJson) opens a dropdown with:
- **Export JSON** — Download flow as `.json` file
- **Import JSON** — Upload and load a flow from `.json` file

---

## 🎨 Visual Design

### File Button
- **Icon:** `FileJson` (Lucide React)
- **Style:** Ghost button, gray-500 text, hover gray-900
- **Tooltip:** "File options"

### Dropdown Menu
- **Items:**
  - Export JSON (with Download icon)
  - Import JSON (with Upload icon)
- **Styling:** Follows Shadcn design system
- **Font:** 13px, medium weight

---

## 💾 Export JSON

### How It Works

1. User clicks **File icon** → **Export JSON**
2. Flow data is formatted as clean JSON
3. File downloads automatically

### Export Format

```json
{
  "version": 1,
  "id": "flow-abc123",
  "title": "Remove User Flow",
  "description": "Flow for removing users from organization",
  "settings": {
    "showDisclaimer": true,
    "simulateThinking": true,
    "entryPoint": "admin-center",
    "productName": "LinkedIn Admin Center"
  },
  "steps": [
    {
      "id": "start-1",
      "type": "start",
      "position": { "x": 50, "y": 50 }
    },
    {
      "id": "welcome-1",
      "type": "turn",
      "speaker": "ai",
      "phase": "welcome",
      "label": "Welcome Message",
      "components": [
        {
          "id": "c1",
          "type": "message",
          "content": { "text": "Hi there! I can help you remove a user." }
        }
      ],
      "position": { "x": 250, "y": 50 }
    }
  ],
  "connections": [
    {
      "id": "e-start",
      "source": "start-1",
      "target": "welcome-1"
    }
  ],
  "metadata": {
    "exportedAt": "2026-02-05T18:30:00.000Z",
    "exportedBy": "VCA Sandbox Studio"
  }
}
```

### Filename Format

`{flow-title}-{YYYY-MM-DD}.json`

**Examples:**
- `remove-user-flow-2026-02-05.json`
- `subscription-cancellation-2026-02-05.json`
- `untitled-flow-2026-02-05.json`

### What's Included

✅ **Flow structure:**
- All steps (Turn, UserTurn, Condition, Start, Note)
- All connections
- Node positions (for canvas layout)

✅ **Content:**
- All components and their props
- Component text, titles, descriptions
- Prompt groups
- Action cards

✅ **Settings:**
- Global flow settings
- Entry point configuration
- Product name
- Feature flags (disclaimer, thinking simulation)

✅ **Metadata:**
- Export timestamp
- Tool version
- Flow title and description

---

## 📤 Import JSON

### How It Works

1. User clicks **File icon** → **Import JSON**
2. File picker opens (accepts `.json` files)
3. User selects a flow JSON file
4. Flow is validated and loaded into canvas

### Validation

**Required fields:**
- `steps` — Must exist and be an array
- `settings` — Must exist and contain global settings

**If validation fails:**
- Alert shown: "Invalid flow file format. Missing required fields."
- Flow is not imported

**If validation succeeds:**
- Flow data is merged with current flow
- Canvas updates immediately
- `lastModified` timestamp is updated

### What Gets Imported

✅ **Overwrites:**
- Title (if present in file)
- Description
- Settings
- Steps (all nodes)
- Connections (all edges)

✅ **Preserves:**
- Flow ID (keeps current flow ID, doesn't overwrite)
- Database state (doesn't affect Supabase)

⚠️ **Note:** Import replaces the current flow in the canvas. Make sure to export the current flow first if you want to keep it!

---

## 🎯 Use Cases

### 1. Backup Flows
**Scenario:** Designer wants to save a local copy before making risky changes

**Workflow:**
1. Export JSON → Save to Desktop
2. Make experimental changes in Studio
3. If changes don't work, import the backup

---

### 2. Share Flows with Teammates
**Scenario:** Designer wants to share a flow with another designer (not via URL)

**Workflow:**
1. Export JSON
2. Send file via Slack/Email
3. Teammate imports JSON into their Studio

---

### 3. Version Control
**Scenario:** Team wants to track flow changes over time

**Workflow:**
1. Export JSON after each major change
2. Commit to Git repository
3. Can diff changes, revert to old versions

---

### 4. Template Library
**Scenario:** Team wants reusable flow templates

**Workflow:**
1. Create "starter flows" (e.g., "Welcome Flow Template")
2. Export as JSON
3. Store in shared folder (Google Drive, Dropbox)
4. Designers import template when starting new flows

---

### 5. SDUI Alignment (Future)
**Scenario:** Once SDUI schema is received, align export format

**Workflow:**
1. Update export function to match SDUI schema
2. Designers export SDUI-compliant JSON
3. Engineers deploy directly to production

---

## 🔧 Technical Details

### Code Location
**File:** `src/views/studio-canvas/CanvasEditor.tsx`

**Functions:**
- `handleExportJSON()` — Lines ~91-120
- `handleImportJSON()` — Lines ~122-165

### Dependencies
- **Lucide React:** `FileJson`, `Download`, `Upload` icons
- **Shadcn UI:** `DropdownMenu` components
- **Native APIs:** FileReader, Blob, URL.createObjectURL

### File Operations
**Export:**
- Uses `Blob` API to create JSON file
- Uses `URL.createObjectURL()` for download link
- Automatically cleans up object URL after download

**Import:**
- Uses native file input (`<input type="file">`)
- Uses `FileReader` API to read file contents
- Parses JSON with `JSON.parse()`
- Validates structure before applying

---

## 🐛 Error Handling

### Export Errors
- **No errors expected** — Export always succeeds
- Flow data is always valid (comes from working flow)

### Import Errors

**Invalid JSON syntax:**
```
Failed to import flow. Please check the file format.
```

**Missing required fields:**
```
Invalid flow file format. Missing required fields.
```

**File read errors:**
```
Failed to import flow. Please check the file format.
```

---

## 🎨 Design System Compliance

✅ **Follows VCA Sandbox design standards:**
- Uses Shadcn UI components
- Lucide React icons (consistent with rest of app)
- Tailwind CSS styling
- Matches toolbar aesthetic (compact, minimal)
- Hover states consistent with other buttons

✅ **Accessibility:**
- Tooltips on hover
- Keyboard navigable dropdown
- Screen reader friendly labels

---

## 🚀 Future Enhancements

### Short-term
- [ ] Add "Copy JSON to clipboard" option
- [ ] Show success toast after export
- [ ] Add preview before import (show flow title)

### Medium-term
- [ ] Export multiple flows at once (bulk export)
- [ ] Import from URL (paste GitHub raw link)
- [ ] Export history (show recent exports)

### Long-term (SDUI)
- [ ] Export as SDUI-compliant JSON
- [ ] Validate against SDUI schema
- [ ] Export with SDUI metadata
- [ ] Integration with LinkedIn's SDUI deployment

---

## 📋 Testing Checklist

### Export
- [ ] Click File → Export JSON
- [ ] File downloads with correct filename
- [ ] JSON is valid and formatted
- [ ] All flow data is present
- [ ] Can open file in text editor

### Import
- [ ] Click File → Import JSON
- [ ] File picker opens
- [ ] Can select `.json` file
- [ ] Flow loads correctly
- [ ] Canvas updates with imported nodes
- [ ] Connections render properly

### Round-trip
- [ ] Export a flow
- [ ] Create a new flow
- [ ] Import the exported file
- [ ] Verify flow matches original

### Error cases
- [ ] Import invalid JSON → Shows error
- [ ] Import JSON missing required fields → Shows error
- [ ] Import non-JSON file → Shows error

---

## 📝 Notes

**What's NOT exported:**
- ❌ Database ID (flow keeps current ID when imported)
- ❌ User/owner information
- ❌ Public/private status
- ❌ Folder assignment
- ❌ Creation/modification timestamps (except exportedAt)

**Why?**
- These are database-specific, not flow definition
- Import should work across different Studio instances
- Flow content is portable, metadata is not

---

**Built with ❤️ for faster flow iteration**
