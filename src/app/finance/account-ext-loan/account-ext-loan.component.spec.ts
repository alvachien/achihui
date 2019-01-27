import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIAccountCtgyFilterExPipe, } from '../pipes';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
  } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { HttpLoaderTestFactory, RouterLinkDirectiveStub, FakeDataHelper } from '../../../testing';
import { AccountExtLoanComponent } from './account-ext-loan.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';

describe('AccountExtLoanComponent', () => {
  let component: AccountExtLoanComponent;
  let fixture: ComponentFixture<AccountExtLoanComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();

    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', ['fetchAllAccountCategories', 'fetchAllAccounts']);
    const fetchAllAccountCategoriesSpy: any = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    const fetchAllAccountsSpy: any = stroageService.fetchAllAccounts.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
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
        UIAccountStatusFilterPipe,
        UIAccountCtgyFilterPipe,
        UIAccountCtgyFilterExPipe,
        UIOrderValidFilterPipe,
        RouterLinkDirectiveStub,
        AccountExtLoanComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
