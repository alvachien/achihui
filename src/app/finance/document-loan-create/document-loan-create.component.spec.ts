import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { Component, Input } from '@angular/core';

import { AccountStatusFilterPipe, OrderValidFilterPipe, UIAccountStatusFilterPipe, UIAccountCtgyFilterPipe,
  UIOrderValidFilterPipe, UIAccountCtgyFilterExPipe, } from '../pipes';
import { UIMode, UserAuthInfo } from '../../model';
import { HttpLoaderTestFactory, ActivatedRouteUrlStub } from '../../../testing';
import { DocumentLoanCreateComponent } from './document-loan-create.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService,
  AuthService } from 'app/services';

@Component({selector: 'hih-finance-account-ext-loan', template: ''})
class AccountExtLoanComponent {
  @Input() uiMode: UIMode;
  @Input() extObject: any;
  @Input() tranAmount: any;
  @Input() controlCenterID: any;
  @Input() orderID: any;
}

describe('DocumentLoanCreateComponent', () => {
  let component: DocumentLoanCreateComponent;
  let fixture: ComponentFixture<DocumentLoanCreateComponent>;

  beforeEach(async(() => {
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
    ]);
    const fetchAllAccountCategoriesSpy: any = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    const fetchAllDocTypesSpy: any = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    const fetchAllTranTypesSpy: any = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    const fetchAllAccountsSpy: any = stroageService.fetchAllAccounts.and.returnValue(of([]));
    const fetchAllOrdersSpy: any = stroageService.fetchAllOrders.and.returnValue(of([]));
    const fetchAllControlCentersSpy: any = stroageService.fetchAllControlCenters.and.returnValue(of([]));
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    const fetchAllCurrenciesSpy: any = currService.fetchAllCurrencies.and.returnValue(of([]));
    const homeService: any = jasmine.createSpyObj('HomeDefService', ['ChosedHome']);
    const chosedHomeSpy: any = homeService.ChosedHome.and.returnValue( {
      _id: 1,
      BaseCurrency: 'CNY',
    });
    const uiServiceStub: Partial<UIStatusService> = {};
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteStub: any = new ActivatedRouteUrlStub([new UrlSegment('createbrwfrm', {})] as UrlSegment[]);
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());

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
        UIAccountStatusFilterPipe,
        UIAccountCtgyFilterPipe,
        UIAccountCtgyFilterExPipe,
        UIOrderValidFilterPipe,
        AccountExtLoanComponent,
        DocumentLoanCreateComponent,
      ],
      providers: [
        TranslateService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinCurrencyService, useValue: currService },
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: AuthService, useValue: authServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLoanCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
