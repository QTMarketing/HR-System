# UI design review — findings snapshot

**Product:** HR System  
**Date:** 2026-03-23 (initial snapshot)  
**Scope:** Incremental improvements only; aligns with `docs/ui-design-review-prompt.md`.

## Cross-cutting

- **Primary focus:** Data (KPIs, tables, charts) should lead; chrome (sidebar, top bar) should recede.
- **3-second test:** User should see “what needs attention” on Overview, and clear task context on other routes.
- **Top changes applied in code (this pass):** Softer sidebar active state (inset accent + muted fill); Overview intro hierarchy so KPIs read as the hero block.
- **Demote later:** Top bar search/filter are global chrome — keep visually quiet until wired to real behavior; mock/dev badges stay small and muted.

---

## Per route

### Overview

| | |
|--|--|
| **Primary focus** | Today’s operational snapshot: clocked-in count, approvals/flags, hours — then trends and open shifts. |
| **3-second test** | “How is labor right now, and what do I need to act on?” |
| **Top 3 changes** | (1) Label the snapshot so KPIs feel like the hero. (2) Keep one clear primary action (e.g. add time entry) aligned to hierarchy. (3) Ensure charts/feed don’t all shout at equal volume — order by decision urgency. |
| **Remove / demote** | Redundant long “focus” copy that repeats the top bar subtitle. |

### Time clock

| | |
|--|--|
| **Primary focus** | Open shifts + recording the next event. |
| **3-second test** | “Who is on the clock and what can I do next?” |
| **Top 3 changes** | Table first on small screens if not already; mute decorative rows; keep actions visually secondary until a row is selected. |
| **Remove / demote** | Extra explanatory text above the fold if it duplicates the top bar. |

### Employees

| | |
|--|--|
| **Primary focus** | Directory by location; add flow secondary. |
| **3-second test** | “Who works where?” |
| **Top 3 changes** | Directory before create form (done); tables use fixed columns for scanability (done). |
| **Remove / demote** | Developer-only copy in user-facing paths. |

### Timesheets

| | |
|--|--|
| **Primary focus** | Period list / approval workflow. |
| **3-second test** | “What periods need my review?” |
| **Top 3 changes** | Strong row hierarchy for pending vs approved; reserve accent for primary actions. |
| **Remove / demote** | Decorative cards that don’t carry status. |

### Reports (index)

| | |
|--|--|
| **Primary focus** | Pick the right report. |
| **3-second test** | “Which report answers my payroll question?” |
| **Top 3 changes** | Cards are appropriate — keep icon weight low (already relatively calm). |
| **Remove / demote** | Long descriptions inside cards if they duplicate detail pages. |

### Report detail (hour mix, labor by store)

| | |
|--|--|
| **Primary focus** | Tables and charts. |
| **3-second test** | “What are the numbers and breakdowns?” |
| **Top 3 changes** | Keep local nav (back / siblings) typographically smaller than page title; chart + table alignment. |
| **Remove / demote** | Ornamental headers. |

### Audit log

| | |
|--|--|
| **Primary focus** | Scan events and trust the trail. |
| **3-second test** | “What changed, when, and who?” |
| **Top 3 changes** | Monospace or tabular nums for timestamps; zebra or borders for row scan. |
| **Remove / demote** | Non-essential filters above the log. |

### Settings

| | |
|--|--|
| **Primary focus** | Task completion per setting group. |
| **3-second test** | “Where do I change X?” |
| **Top 3 changes** | Group settings; single save affordance pattern. |
| **Remove / demote** | Marketing-style copy. |

---

## Sidebar (audit summary)

- **Purpose:** Global navigation + utilities (Settings, Log out) — appropriate.
- **Risk:** Dark rail + strong active pill competed with main canvas data.
- **Mitigation:** Softer active background + **inset left accent** so current route is clear without a heavy fill.

## Navigation discipline

- **Global:** Sidebar + top bar title.
- **Local:** Report subpages should keep “hub vs detail” obvious (existing small nav on reports — preserve hierarchy).

---

_Update this file when you run a new review cycle._
