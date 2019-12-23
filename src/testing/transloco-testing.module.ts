import { TranslocoTestingModule, TranslocoConfig } from '@ngneat/transloco';
import * as en from '../assets/i18n/en.json';
import * as zh from '../assets/i18n/zh.json';
​
export function getTranslocoModule(config: Partial<TranslocoConfig> = {}) {
  return TranslocoTestingModule.withLangs(
    { en, zh },
    {
      availableLangs: ['en', 'zh'],
      defaultLang: 'en',
      ...config
    }
  );
}
