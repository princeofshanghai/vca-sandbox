# Share Feature Roadmap & Logic

## Conceptual Vision (Figma-like)
The dual-button layout and advanced sections were modeled after Figma to support two distinct workflows in the future:

1.  **Editor Access (Header "Copy link")**
    *   **Goal:** Share the *file* for collaboration.
    *   **Target:** Other designers/developers who need to edit the flow.
    *   **Future Behavior:** clicking this generates a link to `studio/editor/:id` with edit permissions.

2.  **Prototype Access (Footer "Copy prototype link")**
    *   **Goal:** Share the *presentation* for review.
    *   **Target:** Stakeholders, managers, clients who only need to view the simulation (no node graph).
    *   **Future Behavior:** clicking this generates a link to `share/:id` (public view-only).

3.  **Granular Permissions**
    *   **Email Invites:** Invite specific users by email to be Editors or Viewers.
    *   **Access Levels:** Toggle "Anyone with link" vs "Restricted".

## Current State (v0.1)
As of Feb 2026, the application is a single-user sandbox without complex backend permissions.

*   **Public Link Only:** The only shareable asset is the **Public Prototype**.
*   **Dual Buttons:** Both "Copy link" and "Copy prototype link" currently point to the same URL (`/share/:id`).
*   **Permissions:** All flows shared via link are technically `is_public: true` (Anyone with link can view).

## Future Implementation Checklist
To restore the full Figma-like functionality later, the following is needed:

- [ ] **Backend:** Implement granular permissions table (Owner, Editor, Viewer).
- [ ] **Backend:** Build "Invite by Email" system (SMTP/Supabase Auth).
- [ ] **UI:** Re-enable email input and "Send" button logic.
- [ ] **UI:** Re-enable "Who has access" dropdowns to toggle permissions.
- [ ] **Routing:** Separate `/studio` (Edit) and `/share` (View) access tokens.
