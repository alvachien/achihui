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

import { HttpLoaderTestFactory, FakeDataHelper } from '../../../testing';
import { AccountTreeComponent } from './account-tree.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';

@Component({selector: 'hih-fin-docitem-by-acntctgy', template: ''})
class DocumentItemByAccountCategoryComponent {
  @Input() selectedCategory: any;
  @Input() selectedAccounts: any;
  @Input() selectedScope: any;
}
@Component({selector: 'hih-fin-docitem-by-acnt', template: ''})
class DocumentItemByAccountComponent {
  @Input() selectedAccount: any;
  @Input() selectedScope: any;
}

describe('AccountTreeComponent', () => {
  let component: AccountTreeComponent;
  let fixture: ComponentFixture<AccountTreeComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildChosedHome();

    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', ['fetchAllAccountCategories', 'fetchAllAccounts']);
    const fetchAllAccountCategoriesSpy: any = stroageService.fetchAllAccountCategories.and.returnValue(of(fakeData.finAccountCategories));
    const fetchAllAccountsSpy: any = stroageService.fetchAllAccounts.and.returnValue(of(fakeData.finAccounts));
    stroageService.Accounts = fakeData.finAccounts;
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
        DocumentItemByAccountCategoryComponent,
        DocumentItemByAccountComponent,
        AccountTreeComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: Router, useValue: routerSpy },
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create', () => {
    expect(component).toBeTruthy();
  });
  it('2. Check tree has been created', () => {
    expect(component.dataSource.data.length).toBeGreaterThan(0);
  });
});
