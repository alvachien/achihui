import { TestBed, inject } from '@angular/core/testing';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HttpLoaderTestFactory } from '../../../../src/testing';
import { PaginatorIntlService } from './paginator-intl.service';

describe('SideNavService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [
            HttpClientTestingModule,
            TranslateModule.forRoot({
              loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderTestFactory,
                deps: [HttpClient],
              },
            }),
          ],
        providers: [
            PaginatorIntlService,
            TranslateService,
        ],
    });
  });

  it('should be created', inject([PaginatorIntlService], (service: PaginatorIntlService) => {
    expect(service).toBeTruthy();
  }));
});
