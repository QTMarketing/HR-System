# Dynamics & trust — UX review prompt (HR System)

Paste the block below into an AI assistant when you want a structured **interaction clarity, feedback, and reliability** review.

---

## Product context (always include)

**Context:** **HR System** (Next.js). Managers/admins use: time clock (open shifts + record event), Overview KPIs/charts, timesheets (filters, CSV export, payroll approval), employees (roster + create), reports, audit log, settings (read-only env + policy edit for admins).

**Constraints:**

- Do not propose new product features — only clarity, feedback, consistency, and safe-guarding of existing interactions.
- Call out places where UI suggests an action but doesn't affect data (**false affordances**).
- Prefer the same patterns for the same job across routes (e.g. clock event vs add time entry).

**Deliverable:** Numbered list of interaction improvements; for each: **location** (route/component), **user intent**, **current risk to trust**, **recommended change**, **how trust improves**.

**Group findings by:**

1. Filters & scope  
2. Actions & confirmations  
3. Loading & errors  
4. Modals vs inline  
5. Cross-screen consistency  

---

## Core principle

**Trust is built through clear intent, immediate feedback, and consistent behavior.**

### 1. Interaction intent

For every interactive element (filters, sorting, bulk actions, buttons):

- Identify the user's intent before the action.
- Ensure the interaction communicates:
  - **What** will happen  
  - **When** it will happen  
  - **Whether** it can be undone  
- Flag any actions that feel **ambiguous**, **surprising**, or **irreversible without warning**.

### 2. Filters, sorting & bulk actions

- Filters and sorting must **clearly indicate when they are active**, show **what data is affected**, and **update results** quickly and predictably.
- Bulk actions must: **confirm scope** (what + how many items), **prevent accidental destructive actions**, and provide **clear success or failure** feedback.

### 3. Modals vs popovers (intent matters)

- Use **modals** only for: blocking decisions, destructive actions, multi-step or high-commitment tasks.
- Use **popovers / inline UI** for: quick edits, previews, low-risk actions.
- Flag **misuse** where interruption is too heavy or too light for the action's intent.

### 4. Feedback & system states

Audit all feedback mechanisms:

- **Loading:** Acknowledge input immediately; show progress if delays exceed a brief threshold.
- **Toasts:** Concise and informative; confirm **outcomes**, not just actions; avoid stacking or flooding.
- **Errors:** Explain what went wrong and what the user can do next; **never blame the user**.

### 5. Speed, consistency & reliability

Interactions should feel **fast**, **predictable**, and **consistent across screens**. Identify: delayed responses without feedback, inconsistent behaviors for similar actions, UI states that feel uncertain or unstable.

### 6. Trust test

After any interaction, the user should feel:

1. "The system understood me"  
2. "The system responded clearly"  
3. "I can trust this to behave the same way next time"  

If not, recommend changes.

---

## Output format (for the reviewer)

- Use the **five groups** above as section headings.  
- Under each, a **numbered** list.  
- Each item: location → intent → risk → change → trust impact.  
- **No new features** — refinements only.

---

## When to re-run

After changing auth, data mode, payroll flows, or adding real wiring to global chrome (search / scope). Compare to `docs/dynamics-trust-review-findings.md` or archive dated copies.
