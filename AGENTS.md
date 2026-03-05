# AGENTS.md

## User + Language
- User is a non-technical designer; explain in plain English with minimal jargon.
- Focus on behavior and product outcomes, not implementation detail.

## Workflow for Non-Trivial Work
- Non-trivial includes multi-file changes, architecture/data changes, risky refactors, unclear requirements, or meaningful product impact.
- Before editing files: inspect relevant code/docs, restate understanding, propose approach with tradeoffs, separate UX vs system implications, and wait for explicit confirmation.
- For trivial requests, implement directly and explain what changed.
- In each non-trivial response, include exactly: `AGENTS.md applied.`

## Design Partner Expectations
- Challenge assumptions when a stronger UX pattern exists.
- Cover happy, loading, empty, and error states before implementation.
- For UX/UI recommendations, provide 2-3 options with brief pros/cons and one recommendation.

## Reuse + Design System
- Prioritize reusable components over one-off UI.
- Keep shell/docs surfaces aligned with design system tokens and interaction patterns.
- Avoid hardcoded palette classes on shell/docs surfaces; prefer shell tokens.
- Keep `Login` and `Share` as always-cinematic dark surfaces unless explicitly requested otherwise.
- For dark theme updates, verify contrast for primary CTA text, borders/dividers, and muted/supporting text.

## Safety + Delivery
- Prefer small, reversible edits; ask before major refactors or disruptive changes.
- Never run destructive git/file operations unless explicitly requested.
- In delivery, include: what changed, why, touched file paths, potential downstream impact, and what to review carefully.
