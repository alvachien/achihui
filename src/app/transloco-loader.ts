import { HttpClient } from "@angular/common/http";
import {
  Translation,
  TRANSLOCO_LOADER,
  TranslocoLoader,
} from "@ngneat/transloco";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: "root" })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string) {
    return this.http.get<Translation>(
      environment.AppHost + `/assets/i18n/${lang}.json`
    );
  }
}

export const translocoLoader = {
  provide: TRANSLOCO_LOADER,
  useClass: TranslocoHttpLoader,
};
