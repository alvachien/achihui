import { ComponentFixture, TestBed } from '@angular/core/testing';
import { format } from 'date-fns';

import { getTranslocoModule } from '../../../testing';
import { SafeAny } from '@common/any';
import { DATE_SCOPES, DEFAULT_DATE_SCOPE, DateScopeKey, resolveDateScope } from './date-scope';
import { DateScopeComponent } from './date-scope.component';

describe('date-scope presets', () => {
  // Wednesday 2026-09-16 (local): the Monday-start week is Sep 14 - Sep 20.
  const NOW = new Date(2026, 8, 16, 12, 0, 0);
  const d = (dt: Date | undefined): string => (dt ? format(dt, 'yyyy-MM-dd') : 'undefined');
  const bounds = (key: DateScopeKey): string => {
    const r = resolveDateScope(key, NOW);
    return r ? `${d(r.bgn)} .. ${d(r.end)}` : 'undefined';
  };

  it('resolves every preset to its exact inclusive window', () => {
    expect(bounds('today')).toBe('2026-09-16 .. 2026-09-16'); // one-day window
    expect(bounds('week')).toBe('2026-09-14 .. 2026-09-20'); // Monday-start weeks
    expect(bounds('month')).toBe('2026-09-01 .. 2026-09-30');
    expect(bounds('quarter')).toBe('2026-07-01 .. 2026-09-30'); // Q3
    expect(bounds('year')).toBe('2026-01-01 .. 2026-12-31');
    expect(bounds('lastMonth')).toBe('2026-08-01 .. 2026-08-31');
    expect(bounds('lastQuarter')).toBe('2026-04-01 .. 2026-06-30'); // Q2
    expect(bounds('lastYear')).toBe('2025-01-01 .. 2025-12-31');
    expect(bounds('ytd')).toBe('2026-01-01 .. 2026-09-16'); // end-of-day today
  });

  it("'none` means no restriction (undefined window)", () => {
    expect(resolveDateScope('none', NOW)).toBeUndefined();
  });

  it('offers every key in the menu table, month is the default', () => {
    const keys = DATE_SCOPES.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length); // no duplicates
    for (const key of keys) {
      expect(() => resolveDateScope(key, NOW)).not.toThrow(); // table/maths agree
    }
    expect(keys).toContain(DEFAULT_DATE_SCOPE);
  });
});

describe('DateScopeComponent', () => {
  let fixture: ComponentFixture<DateScopeComponent>;
  let component: DateScopeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateScopeComponent, getTranslocoModule()],
    }).compileComponents();
    fixture = TestBed.createComponent(DateScopeComponent);
    component = fixture.componentInstance;
  });

  it('opens on the default scope and renders a dropdown trigger', () => {
    fixture.detectChanges();
    expect(component.scope()).toBe(DEFAULT_DATE_SCOPE);
    const trigger = fixture.nativeElement.querySelector('button[nz-dropdown]') as HTMLElement | null;
    expect(trigger).toBeTruthy();
    expect(component.scopeLabel()).toBe('DateScope.ThisMonth');
  });

  it('emits the resolved window on change; re-picking the active scope re-emits a fresh window', () => {
    const emissions: SafeAny[] = [];
    const keys: SafeAny[] = [];
    component.rangeChange.subscribe((r) => emissions.push(r));
    component.keyChange.subscribe((k) => keys.push(k));

    // Same key re-emits: the month/year presets resolve against the CURRENT
    // clock, so re-picking is the refresh gesture for a tab left open across a
    // boundary (consumers dedupe an unchanged query).
    component.select('month');
    expect(emissions.length).toBe(1);
    expect(keys).toEqual(['month']);

    component.select('lastMonth');
    expect(component.scope()).toBe('lastMonth');
    expect(emissions.length).toBe(2);
    expect(emissions[1].bgn < emissions[1].end).toBe(true);

    component.select('none'); // "no restriction" crosses the boundary as undefined
    expect(emissions.length).toBe(3);
    expect(emissions[2]).toBeUndefined();
    expect(component.scope()).toBe('none');
    expect(keys).toEqual(['month', 'lastMonth', 'none']);
  });
});
