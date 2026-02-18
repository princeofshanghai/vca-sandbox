# Condition Branch Editor Redesign Proposal

## Objective
Make the `ConditionBranchEditor` intuitive for non-technical designers, moving away from technical terminology like "Logic", "Variable", and "Operator".

## Current State Analysis
- **Terminology**: Uses "Routing Logic", "Variable", "Operator", "Value".
- **Interaction**: Standard form fields that feel like database entry.
- **Cognitive Load**: User must mentally translate "User is VIP" into `variable="user_status"`, `operator="eq"`, `value="vip"`.

## Proposed Solutions

### Option A: The "Sentence Builder" (Recommended)
Transform the logic section into a natural language sentence construction.

**UI Concept:**
> **When should this path be taken?**
>
> 🔘 **Always (Default Path)**
>
> 🔘 **When condition is met:**
>    "If [ User Attribute ▾ ] is equal to [ Value ]"

**Pros:**
- Reads like English.
- Hides the underlying data structure.
- Extremely intuitive for logic-based thinking.

**Cons:**
- Limited to simple logic (which matches current functionality).

### Option B: The "Visual Card"
Treat the condition as a visual object or "rule" card.

**UI Concept:**
> **Rules**
> [ Icon ] **User Status** is **VIP**
> (+ Add Rule)

**Pros:**
- Modular and expandable.
- Visually distinct.

**Cons:**
- Might feel "heavy" for a simple equality check.

### Option C: The Guided Inputs
Rename fields and add helper text, keeping the structure similar but friendlier.

**UI Concept:**
> **Path Settings**
> Name: "VIP Path"
>
> **Trigger**
> Check: [ User Attribute ▾ ]
> For Value: [ "VIP" ]

**Pros:**
- Minimal changes to codebase.
- Clearer labels.

**Cons:**
- Still feels a bit form-like.

## Recommendation
**Option A (Sentence Builder)** fits the "Design Partner Mode" goal best. It abstracts the technical implementation into a user-centric mental model.
