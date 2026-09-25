/**
 * date-scope.ts — preset math for the filter bar's date-scope segment
 * (hih-date-scope). Adopted 2026-09-15 on the document list, replacing the
 * header nz-range-picker (see docs/filter-dialog-generic-design.md Appendix C).
 *
 * The scope is a coarse PAGE-SCOPE window, deliberately outside the structured
 * filter dialog: it has a sensible default ('month') and survives Clear
 * filter, which a guardrail must. 'none' ("No restriction") drops the date
 * clause entirely — a precise/custom window is then what the dialog's date
 * conditions (e.g. document-list's TranDate) are for.
 */
import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subMonths,
  subQuarters,
  subYears,
} from 'date-fns';

export type DateScopeKey =
  'today' | 'week' | 'month' | 'quarter' | 'year' | 'lastMonth' | 'lastQuarter' | 'lastYear' | 'ytd' | 'none';

/** Inclusive window; the page formats the bounds into its date clause. */
export interface DateScopeRange {
  bgn: Date;
  end: Date;
}

/** Menu contents and order; labels are i18n keys under the DateScope group. */
export const DATE_SCOPES: ReadonlyArray<{ key: DateScopeKey; labelKey: string }> = [
  { key: 'today', labelKey: 'DateScope.Today' },
  { key: 'week', labelKey: 'DateScope.ThisWeek' },
  { key: 'month', labelKey: 'DateScope.ThisMonth' },
  { key: 'quarter', labelKey: 'DateScope.ThisQuarter' },
  { key: 'year', labelKey: 'DateScope.ThisYear' },
  { key: 'lastMonth', labelKey: 'DateScope.LastMonth' },
  { key: 'lastQuarter', labelKey: 'DateScope.LastQuarter' },
  { key: 'lastYear', labelKey: 'DateScope.LastYear' },
  { key: 'ytd', labelKey: 'DateScope.YearToDate' },
  { key: 'none', labelKey: 'DateScope.NoRestriction' },
];

/** The scope list pages open with (also the "unbolded" state of the trigger). */
export const DEFAULT_DATE_SCOPE: DateScopeKey = 'month';

/** Weeks start on Monday — the app's locale convention; date-fns defaults to Sunday. */
const WEEK_OPTIONS = { weekStartsOn: 1 as const };

/** The active window for `key`; `undefined` = no restriction (no date clause). */
export function resolveDateScope(key: DateScopeKey, now: Date = new Date()): DateScopeRange | undefined {
  switch (key) {
    case 'today':
      return { bgn: startOfDay(now), end: endOfDay(now) };
    case 'week':
      return { bgn: startOfWeek(now, WEEK_OPTIONS), end: endOfWeek(now, WEEK_OPTIONS) };
    case 'month':
      return { bgn: startOfMonth(now), end: endOfMonth(now) };
    case 'quarter':
      return { bgn: startOfQuarter(now), end: endOfQuarter(now) };
    case 'year':
      return { bgn: startOfYear(now), end: endOfYear(now) };
    case 'lastMonth': {
      const prev = subMonths(startOfMonth(now), 1);
      return { bgn: prev, end: endOfMonth(prev) };
    }
    case 'lastQuarter': {
      const prev = subQuarters(startOfQuarter(now), 1);
      return { bgn: prev, end: endOfQuarter(prev) };
    }
    case 'lastYear': {
      const prev = subYears(startOfYear(now), 1);
      return { bgn: prev, end: endOfYear(prev) };
    }
    case 'ytd':
      return { bgn: startOfYear(now), end: endOfDay(now) };
    case 'none':
      return undefined;
  }
}
