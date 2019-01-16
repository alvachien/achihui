import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { HttpLoaderTestFactory, FakeDataHelper } from '../../../testing';
import { TranTypeTreeComponent } from './tran-type-tree.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';

describe('TranTypeTreeComponent', () => {
  let component: TranTypeTreeComponent;
  let fixture: ComponentFixture<TranTypeTreeComponent>;
  let fakeData: FakeDataHelper;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildFinConfigData();

    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllTranTypes',
    ]);
    const fetchAllTranTypesSpy: any = stroageService.fetchAllTranTypes.and.returnValue(of(fakeData.finTranTypes));

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        TranTypeTreeComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinanceStorageService, useValue: stroageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranTypeTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create', () => {
    expect(component).toBeTruthy();
  });
  it('2. Ensure data is loaded successfully', () => {
    expect(component.dataSource.data.length).toBeGreaterThan(0);
  });
});
