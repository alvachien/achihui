import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';

import { HttpLoaderTestFactory, ActivatedRouteUrlStub } from '../../../testing';
import { AccountDetailComponent } from './account-detail.component';
import { UIMode } from '../../model';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';

@Component({selector: 'hih-finance-account-ext-adp', template: ''})
class ExtADPStubComponent {
  @Input() uiMode: UIMode;
  @Input() extObject: any;
}
@Component({selector: 'hih-finance-account-ext-asset', template: ''})
class ExtAssetStubComponent {
  @Input() uiMode: UIMode;
  @Input() extObject: any;
}
@Component({selector: 'hih-finance-account-ext-loan', template: ''})
class ExtLoanStubComponent {
  @Input() uiMode: UIMode;
  @Input() extObject: any;
}

describe('AccountDetailComponent', () => {
  let component: AccountDetailComponent;
  let fixture: ComponentFixture<AccountDetailComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(async(() => {
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteStub: any = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);
    const homeService: any = jasmine.createSpyObj('HomeDefService', ['ChosedHome', 'fetchAllMembersInChosedHome']);
    const chosedHomeSpy: any = homeService.ChosedHome.and.returnValue( {
      _id: 1,
    });
    const chosedHomeMemSpy: any = homeService.fetchAllMembersInChosedHome.and.returnValue();
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', ['fetchAllAccountCategories', 'fetchAllAssetCategories']);
    const allAccountCtgySpy: any = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    const allAssetCtgySpy: any = stroageService.fetchAllAssetCategories.and.returnValue(of([]));
    const uiServiceStub: Partial<UIStatusService> = {};

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
        ExtADPStubComponent,
        ExtAssetStubComponent,
        ExtLoanStubComponent,
        AccountDetailComponent ,
      ],
      providers: [
        TranslateService,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: UIStatusService, uiServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDetailComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
    fixture.detectChanges();
  });

  it('1. should be created', () => {
    expect(component).toBeTruthy();
  });
});
