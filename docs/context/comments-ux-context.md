# Comments UX Context

This file is intentionally practical.
Its job is to help future comment UI/UX requests get scoped correctly and save back-and-forth.

If you are prompting Codex about comments UX, point it to:
`@docs/context/comments-ux-context.md`

## Comments in One Sentence

Treat comments as one product feature with two closely related technical implementations:
- canvas comments in Studio and Share Studio
- review comments in Share

## Main Mental Model

- `StudioView` and `ShareStudioView` should usually be treated as the same comment UX family.
- `ShareView` should usually be treated as the related but more specialized comment UX family.
- Shared visual changes often cascade across all 3 views.
- Placement behavior, popover behavior, and review-specific behavior do not always cascade automatically.

## View Relationship

### Studio + Share Studio

These two views share the same main comment stack:
- `src/views/studio/StudioView.tsx`
- `src/views/share/ShareStudioView.tsx`
- `src/views/studio-canvas/CanvasEditor.tsx`
- `src/views/studio/useCanvasCommentsController.ts`
- `src/views/studio/CanvasCommentPopover.tsx`
- `src/views/studio/CanvasCommentsDrawer.tsx`

This means:
- comment placement behavior is shared
- comment pin drop behavior is shared
- comment popover behavior is shared
- comment drawer behavior is shared

### Share

This view has its own review-oriented stack:
- `src/views/share/ShareView.tsx`

This means Share can keep deliberate differences like:
- transcript/review placement behavior
- path-aware comment states
- review rail/list behavior
- hover previews and review-specific labels

## Shared Building Blocks

These are the most important shared comment UI pieces right now:

### Shared Pin

- `src/views/share/components/ShareCommentPin.tsx`

If the comment pin visual changes, assume that change will affect:
- Studio
- Share Studio
- Share

### Shared Comment UI Primitives

- `src/components/comments/CommentPrimitives.tsx`

This file currently covers:
- comment avatar
- resolved badge
- comment action menu
- composer input row

Important:
- the composer input row is shared between new-comment input and threaded reply input
- so if the comment input pill changes, replies should usually change too

### Shared Textarea Behavior

- `src/components/shell/ShellTextareaAutosize.tsx`

If textarea focus treatment or autosizing behavior changes here, it can affect comment inputs across multiple views.

### Shared Motion

- `src/index.css`

Comment drop animations and reduced-motion behavior live here when they are shared across multiple views.

## What Usually Cascades

If you ask to update these, Codex should usually check all 3 views:
- pin visual treatment
- add-comment input pill
- reply input pill
- avatar/header/action menu styling
- resolved badge styling
- shared comment motion
- shared focus behavior

## What Does Not Automatically Cascade

If you ask to update these, Codex should not assume one file change is enough:
- first-click placement behavior
- canvas vs transcript placement rules
- comment drawer behavior
- review/path messaging
- hover previews
- popover positioning logic
- edit-mode textarea treatment

Important:
- edit mode is still separate from the small add-comment/reply input pill
- so “update the comment input” should not automatically mean “update edit mode” unless requested or clearly appropriate

## Practical Rule for Future Requests

When asked to update comments UX, Codex should check:
- new comment creation
- threaded reply
- edit state
- resolved state
- signed-out state
- loading state
- empty state
- error state

And Codex should think about:
- Studio
- Share Studio
- Share

## Safe Assumptions

These are safe default assumptions unless the request says otherwise:
- `StudioView` and `ShareStudioView` should stay aligned
- `ShareView` should feel related, but can keep deliberate review-specific differences
- new comment input and reply input should usually match
- subtle polish changes should preserve existing logic unless the request explicitly asks to change interaction behavior

## Good Prompting Pattern

When asking for a comments UX update, it is helpful to say whether you want:
- Studio only
- Studio + Share Studio
- all 3 comment surfaces

It is also helpful to say whether the request should affect:
- only the new-comment input
- new-comment input and reply input
- edit mode too

## Short Version

Comments are one feature, but not one single implementation.

- Studio + Share Studio share the same canvas comment system.
- Share uses a separate review-oriented comment system.
- Shared primitives now cover the pin, comment avatar/header pieces, and the small composer input row.
- Because of that, visual changes to the pin or composer row often cascade across all 3 views.
- Placement logic, review logic, popover behavior, and edit-mode behavior still need to be reviewed deliberately.
