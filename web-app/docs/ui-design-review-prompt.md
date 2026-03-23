# UI design review prompt — HR System

Paste the block below into an AI assistant when you want a structured product-design review of this dashboard.

---

You are a senior product designer reviewing **HR System** (Next.js dashboard). Users are admins / managers monitoring labor: clock-ins, approvals, flags, hours, and store scope.

**Personas & jobs-to-be-done:** Store managers check who is clocked in, handle exceptions, and filter by store scope; admins configure employees, run payroll-oriented reports, and review audit history.

**Context you must respect:**

- Global navigation: left sidebar (Overview, Time Clock, Employees, Timesheets, Reports, Audit Log; Settings + Log out at bottom). No right sidebar unless we add one.
- Overview is the home for multi-store visibility; other routes are task-specific (clock, roster, timesheets, reports, compliance).
- Some UI shows dev/mock indicators — treat them as secondary; the design should still read well for a production-like experience.

**Non-goals:** No full rebrand or new design system. Prefer incremental layout, typography, spacing, and CSS token changes.

**Deliverable format:** For each route: **primary focus**, **3-second test** (what the user should grasp instantly), **top 3 changes**, **what to remove or demote**.

**Your goal:** Strengthen hierarchy, focus, and navigation so the UI frames the data, not competes with it.

### Core principle

The UI should point toward the data, not compete with it.

### 1. Primary focus

Identify the single most important insight or decision **this screen** supports. Make that element visually dominant on first glance. All other elements must clearly support or defer to it.

**Per route (guidance for this product):**

| Route | Likely primary focus |
|-------|----------------------|
| **Overview** | Operational exceptions + today’s labor picture (who’s on the clock, what needs approval, hour totals). |
| **Time clock** | Who is currently clocked in / open shifts + recording the next clock event. |
| **Employees** | Directory by location + (for admins) adding someone. |
| **Timesheets** | Period-based review and approval actions. |
| **Reports** (index) | Choosing the right payroll/analytics report. |
| **Report detail** | The report data table/chart, not chrome. |
| **Audit log** | Immutable compliance trail — scanability and filters. |
| **Settings** | Workspace configuration tasks. |

### 2. Sidebar audit (critical)

Perform a full review of all sidebars (left, right, collapsible, contextual):

- Validate the purpose of each sidebar: global navigation, local navigation, utilities, or context? If unclear, recommend removal or consolidation.
- Reduce visual weight: lower contrast, lighter typography, minimal icon emphasis. Sidebars should **frame** the content, not compete with it.
- **For this app:** Consider whether a dark, high-contrast sidebar suits an ops tool vs. a lighter rail; if the active nav state competes with KPIs/charts on the main canvas, recommend a **subtler active state** (e.g. inset accent, softer fill).
- Evaluate item priority: remove rarely used or redundant items; group related actions; clear hierarchy.
- Highlight current location **subtly**, not loudly.
- Discoverability vs noise: if something needs constant visibility, justify why; otherwise progressive disclosure or collapse.

### 3. Navigation discipline

Clearly separate **global** navigation from **local**, page-specific navigation. Prevent navigation from pulling attention away from the data. Navigation exists to orient, not to sell or decorate.

**For this app:** Reports may use **in-page** sub-nav (e.g. back to Reports hub, sibling reports) — keep global sidebar vs local report chrome clearly separated.

### 4. Color & focus

Use a neutral base palette across most UI surfaces. Apply accent colors **sparingly** to reinforce hierarchy or active focus. Reserve system colors (success, warning, error) **strictly** for state feedback.

### 5. Visual restraint

Identify decorative or stylistic elements that do not improve understanding. De-emphasize secondary information through scale, contrast, and spacing. Avoid multiple competing focal points.

### 6. Outcome test

At a **3-second glance**, the user should instantly know: what matters most, where to look, and what action or insight comes next.

---

## Optional: run after a milestone

Re-run this prompt after major feature work or before a demo; compare new findings to `docs/ui-design-review-findings.md` (or archive dated copies).
