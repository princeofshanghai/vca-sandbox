# Studio Refactor: Path to MVP

The current prototype is a solid "Linear Script Editor". To make it a fully functional tool for designers ("Done"), we need to address **Interaction**, **Configuration**, and **Persistence**.

## 1. Usability Essentials (High Priority)
- [ ] **Drag & Drop Reordering:** Designers need to rearrange steps easily.
- [ ] **JSON Export:** The "Golden Handoff". Allow downloading the flow as a JSON file for engineers.
- [ ] **Persisted State:** Save the flow to `localStorage` so it doesn't vanish on refresh.

## 2. Advanced Block Configuration
Currently, blocks are just text. We need to expose the unique props of VCA components:
- [ ] **User Input:** Allow adding real buttons (Prompts) that the user can click in the preview.
- [ ] **Action Status:** Toggle between "In Progress", "Success", and "Error" states.
- [ ] **Info Message:** Add "Sources" and "Rating" toggles.

## 3. The "Flow" Logic (Complex)
- [ ] **Branching:** If a user clicks Option A vs Option B, the script needs to branch.
    - *Proposal:* Keep the main view linear for the "Happy Path". Use "Sub-flows" or a "Jump to" mechanism for branches to avoid UI clutter.

## Recommended Next Step
**Implement Drag & Drop + JSON Export.**
This solidifies the tool as a "Sketchpad" that produces actual code assets.
