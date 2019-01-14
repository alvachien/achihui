import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

export function HttpLoaderTestFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
