import {
  TranslocoTestingModule,
  TranslocoTestingOptions,
} from "@ngneat/transloco";
import * as en from "../assets/i18n/en.json";
import * as zh from "../assets/i18n/zh.json";
export function getTranslocoModule(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: { en, zh },
    translocoConfig: {
      availableLangs: ["en", "zh"],
      defaultLang: "en",
    },
    preloadLangs: true,
    ...options,
  });
}
