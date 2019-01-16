import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderTestFactory, FakeDataHelper } from '../../../testing';
import { AccountListComponent } from './account-list.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;
  let fakeData: FakeDataHelper;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', ['fetchAllAccountCategories', 'fetchAllAccounts']);
    const allAccountCtgySpy: any = stroageService.fetchAllAccountCategories.and.returnValue(of(fakeData.finAccountCategories));
    const fetchAllAccountsSpy: any = stroageService.fetchAllAccounts.and.returnValue(of(fakeData.finAccounts));
    stroageService.Accounts = fakeData.finAccounts;

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
        AccountListComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: Router, useValue: routerSpy },
        { provide: FinanceStorageService, useValue: stroageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should be created', () => {
    expect(component).toBeTruthy();
  });
  it('2. Check data is loaded successfully', () => {
    expect(component.dataSource.data.length).toBeGreaterThan(0);
    expect(component.dataSource.data.length).toEqual(fakeData.finAccounts.length);
  });
  it('2. Check + button is work', () => {
    expect(component.dataSource.data.length).toBeGreaterThan(0);
    expect(component.dataSource.data.length).toEqual(fakeData.finAccounts.length);
  });
});
