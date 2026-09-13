import { LOCALE_ID } from '@angular/core';
import { NumberSymbol, getLocaleNumberSymbol } from '@angular/common';

import { appConfig } from './app.config';

/**
 * Regression guard for the production NG02100 flood (2026-09-10):
 * the configured LOCALE_ID must have locale data registered under a key that
 * Angular's findLocaleData() can resolve (exact id or parent locale).
 * Previously the zh data was registered as 'zh-cn' while prod LOCALE_ID is 'zh',
 * so every `number`/`currency` pipe threw on every change-detection cycle.
 */
function configuredLocaleId(): string {
  const provider = (appConfig.providers as { provide?: unknown; useValue?: unknown }[]).find(
    (p) => p && typeof p === 'object' && p.provide === LOCALE_ID,
  );
  return String(provider?.useValue);
}

describe('appConfig locale registration', () => {
  it('resolves the configured LOCALE_ID against registered locale data', () => {
    const localeId = configuredLocaleId();
    expect(localeId).toBeTruthy();
    expect(() => getLocaleNumberSymbol(localeId, NumberSymbol.Decimal)).not.toThrow();
  });

  it("resolves 'zh' (prod DefaultLanguage) and 'zh-CN' regardless of test environment", () => {
    expect(() => getLocaleNumberSymbol('zh', NumberSymbol.Decimal)).not.toThrow();
    expect(() => getLocaleNumberSymbol('zh-CN', NumberSymbol.Decimal)).not.toThrow();
  });
});
