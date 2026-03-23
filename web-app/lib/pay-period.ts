export type PayPeriodPreset =
  | "last_14_days"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month";

function toYmdUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Calendar ranges in UTC (date inputs). */
export function payPeriodRange(preset: PayPeriodPreset): { from: string; to: string } {
  const today = new Date();

  if (preset === "last_14_days") {
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - 14);
    return { from: toYmdUtc(from), to: toYmdUtc(today) };
  }

  if (preset === "this_week") {
    const dow = today.getUTCDay();
    const daysFromMonday = dow === 0 ? 6 : dow - 1;
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - daysFromMonday);
    return { from: toYmdUtc(start), to: toYmdUtc(today) };
  }

  if (preset === "last_week") {
    const thisWeek = payPeriodRange("this_week");
    const thisMonday = new Date(`${thisWeek.from}T00:00:00.000Z`);
    const lastSunday = new Date(thisMonday);
    lastSunday.setUTCDate(lastSunday.getUTCDate() - 1);
    const lastMonday = new Date(thisMonday);
    lastMonday.setUTCDate(lastMonday.getUTCDate() - 7);
    return { from: toYmdUtc(lastMonday), to: toYmdUtc(lastSunday) };
  }

  if (preset === "this_month") {
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    return { from: toYmdUtc(start), to: toYmdUtc(today) };
  }

  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0));
  return { from: toYmdUtc(start), to: toYmdUtc(end) };
}

export const PAY_PERIOD_LABELS: Record<PayPeriodPreset, string> = {
  last_14_days: "Last 14 days",
  this_week: "This week",
  last_week: "Last week",
  this_month: "This month",
  last_month: "Last month",
};
