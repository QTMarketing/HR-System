# Dynamics & trust — findings snapshot

**Product:** HR System  
**Date:** 2026-03-24 (initial snapshot; aligns with `docs/dynamics-trust-review-prompt.md`)

These are **review notes**, not a commitment to implement everything. Use them as a backlog for trust-focused UX polish.

---

## 1. Filters & scope

1. **`components/dashboard/topbar.tsx` — Search + “Filter Scope”**  
   - **Intent:** Narrow what the user sees on the current page (or globally).  
   - **Risk:** Controls are visible on every dashboard route but **do not filter data** → classic false affordance; users assume the list/KPIs are wrong.  
   - **Change:** Wire to real behavior, or hide/disable with helper text (“Coming soon”), or scope visually to routes where search applies.  
   - **Trust:** UI matches outcome; no “broken” chrome.

2. **`components/dashboard/time-clock-panel.tsx` — Floor scope**  
   - **Intent:** Limit open shifts to one location.  
   - **Risk:** Low if label + dropdown state are clear; ensure employee dropdown label reflects filter (“filtered by floor scope”).  
   - **Change:** When `All stores` vs one store is selected, a **one-line active filter summary** above the table can reinforce scope.  
   - **Trust:** User always knows which subset of the floor they’re viewing.

3. **`components/dashboard/timesheets-view.tsx` — Store + date range + presets**  
   - **Intent:** Define which closed shifts appear.  
   - **Risk:** After changing dates, **isFetching** on Refresh only — user may not notice background refetch; empty state could feel like “lost data.”  
   - **Change:** Subtle “Updating…” on the table card when `isFetching && !isLoading`, or disable filters briefly during fetch.  
   - **Trust:** System acknowledges the filter change immediately.

4. **`components/dashboard/audit-log-view.tsx` — Date + entity/action**  
   - **Intent:** Narrow audit rows.  
   - **Risk:** Refresh required to apply mental model if users expect live filter-on-blur (currently button refetch).  
   - **Change:** Document interaction in microcopy (“Apply filters with Refresh”) or auto-debounce refetch — **refinement only**, same feature.  
   - **Trust:** Predictable cause → effect.

---

## 2. Actions & confirmations

5. **`components/dashboard/timesheets-view.tsx` — Approve / Revoke payroll**  
   - **Intent:** Mark one row approved or clear approval.  
   - **Risk:** **No confirmation**; Revoke is one click; payroll is compliance-sensitive.  
   - **Change:** Confirm dialog or inline “Are you sure?” for **Revoke** (and optionally first-time Approve); toast already confirms count — add **which employee/period** in toast when single row.  
   - **Trust:** Irreversible-feeling actions match user expectation of care.

6. **`components/dashboard/add-employee-form.tsx` — Create employee**  
   - **Intent:** Provision account + assignments.  
   - **Risk:** High-impact; single submit without summary of what will be created.  
   - **Change:** Pre-submit summary line (“Will create login for {email} at {N} locations”) — copy/inline only, not a new feature.  
   - **Trust:** User verifies intent before commit.

7. **`components/dashboard/settings-view.tsx` — Save policy**  
   - **Intent:** Persist overtime/rounding for a store.  
   - **Risk:** Save is destructive to prior numbers if misunderstood; toast on success is good.  
   - **Change:** Short inline note after save or disabled Save until dirty state — if not already implied by form.  
   - **Trust:** Clear boundary between “editing” and “saved.”

---

## 3. Loading & errors

8. **`components/dashboard/time-entry-dialog.tsx` — Submit**  
   - **Intent:** Record manual clock event.  
   - **Risk:** `toast.info("Submitting…")` then success/error — good; double toast might feel noisy if success follows immediately.  
   - **Change:** Prefer **button loading state** only, or dismiss info toast on success.  
   - **Trust:** Feedback matches importance (one clear outcome).

9. **API error surfaces (various views)**  
   - **Intent:** Recover from failure.  
   - **Risk:** Raw server messages in toasts/cards can confuse non-technical users.  
   - **Change:** Map known errors to **next step** (“Sign in again”, “Try again”, “Contact admin”) — already started on several routes; extend pattern.  
   - **Trust:** User knows what to do, not just that something failed.

10. **Report views — `hour-mix-report-view` / `labor-by-store-report-view`**  
    - **Intent:** Load analytics.  
    - **Risk:** Skeleton then error card is fine; ensure **retry** affordance is consistent with timesheets Refresh where possible.  
    - **Change:** Optional “Retry” on error card mirroring other pages.  
    - **Trust:** Same failure pattern everywhere.

---

## 4. Modals vs inline

11. **`components/dashboard/time-entry-dialog.tsx` — Modal for time entry**  
    - **Intent:** Blocking, focused task (manual event).  
    - **Risk:** Modal is **appropriate**; ensure Escape/overlay close doesn’t lose form without warning if dirty (Radix `onOpenChange`).  
    - **Change:** If form dirty, confirm before close — refinement.  
    - **Trust:** No accidental loss of work.

12. **`components/dashboard/time-clock-panel.tsx` — Inline record event**  
    - **Intent:** Same domain as dialog, different surface.  
    - **Risk:** Two UIs for similar job — buttons enable rules must **match** Overview dialog behavior (already same API).  
    - **Change:** Align labels, button order, and error messages across **Time clock** and **Add Time Entry** dialog.  
    - **Trust:** “Same product” feeling.

---

## 5. Cross-screen consistency

13. **Clock events: Overview dialog vs Time clock panel**  
    - **Intent:** Record in/out/break.  
    - **Risk:** Different layout, different employee picker (flat vs optgroup).  
    - **Change:** Harmonize **terminology** (Clock in vs Clock In), **toast wording**, and **disabled-button hints** (optional `title` on disabled primary).  
    - **Trust:** Learn once, apply everywhere.

14. **Success toasts across mutations**  
    - **Intent:** Know the action landed.  
    - **Risk:** Mix of patterns (`Recorded X for Y`, `Updated N row(s)`, `Policy updated`).  
    - **Change:** Light standardization: **verb + object + scope** (e.g. “Approved payroll for {name}” / “Revoked approval for {name}”).  
    - **Trust:** Predictable language.

15. **Demo vs live data**  
    - **Intent:** Interpret KPIs and reports.  
    - **Risk:** If dev banner hidden, demo mode might look like production.  
    - **Change:** Keep subtle **dataset indicator** on KPIs or footer when `dataMode === mock` (non-blocking badge) — optional refinement.  
    - **Trust:** Users don’t mistake sample numbers for payroll truth.

---

_Update this file when you run a new review cycle._
