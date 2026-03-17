# Markdown Surface Roles

This document explains how rich text should feel across the three Studio surfaces that show message-like content:

- `Flow Preview`
- `Simple Component Card`
- `Editor`

These surfaces are related, but they do not all have the same job.

## Core Mental Model

Think of the three surfaces like this:

- `Flow Preview` is the mirror.
- `Simple Component Card` is the snapshot.
- `Editor` is the workspace.

In plain English:

- `Flow Preview` should answer: "What will the real user actually see?"
- `Simple Component Card` should answer: "What is this component at a glance?"
- `Editor` should answer: "How do I write and structure this content?"

## Surface Roles

### `Flow Preview`: the mirror

`Flow Preview` should be the closest thing to production.

- Use the real VCA components, not lookalikes.
- Match the real layout, spacing, typography, and behavior as closely as possible.
- If a designer wants confidence before shipping, this is the surface they should trust.

UX feeling:

- trustworthy
- production-like
- confidence-building

### `Simple Component Card`: the snapshot

The canvas card is a compact summary, not a full simulation.

- It does not need to match production exactly.
- It should still be immediately recognizable as the same component.
- It should optimize for scanning, identification, and quick comparison across many nodes.

UX feeling:

- lightweight
- scannable
- recognizable at a glance

### `Editor`: the workspace

The editor is for authoring, not for final visual validation.

- It should borrow enough from the final component styling to keep people oriented.
- It may use more shell UI and editing affordances than the final experience.
- It should optimize for writing, selecting, formatting, and revising content.

UX feeling:

- practical
- supportive
- easy to write in

## What Must Stay Aligned Across All Three

Even though these surfaces have different jobs, they should still feel related.

- The same component should be easy to recognize in every surface.
- Message hierarchy should stay recognizable.
- Links, bold text, lists, and other rich text patterns should remain identifiable.
- Happy, loading, empty, and error states should still be understandable at a glance.
- The tone should feel like the same design system family, even when density changes.

## What Is Allowed To Vary

These differences are expected and healthy:

- `Flow Preview` can be fully interactive while `Simple Component Card` can use static links.
- `Simple Component Card` can use tighter spacing and scrolling to stay compact.
- `Editor` can use shell controls, prompts, and formatting affordances that do not exist in production.
- Cards and editors can simplify or compress content as long as identity stays clear.

## Decision Rules

When deciding whether something is a bug or an intentional difference, use these rules:

1. If the question is "What will the user really get?", trust `Flow Preview`.
2. If the question is "Can I identify this component quickly on the canvas?", check `Simple Component Card`.
3. If the question is "Can I write and edit this comfortably?", check the `Editor`.

## Guardrails

- Do not force `Simple Component Card` or `Editor` to become pixel-perfect copies of production.
- Do not let `Simple Component Card` or `Editor` drift so far that the component becomes hard to recognize.
- Fix production-fidelity issues in the real VCA component or shared renderer, not by patching the shell frame around it.
- Treat visual differences outside `Flow Preview` as intentional only when they clearly support scanning or authoring.

## Example: Message With a Link

For the same message content:

- `Flow Preview` should show the real message styling and real link behavior.
- `Simple Component Card` should show the link text in a compact, non-interactive way so the content is still recognizable.
- `Editor` should make the link easy to author and inspect, even if the editor chrome looks more utilitarian than production.
