import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderTestFactory } from '../../../testing';
import { AccountListComponent } from './account-list.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;

  beforeEach(async(() => {
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', ['fetchAllAccountCategories', 'fetchAllAccounts']);
    const allAccountCtgySpy: any = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    const fetchAllAccountsSpy: any = stroageService.fetchAllAccounts.and.returnValue(of([]));
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
        AccountListComponent,
      ],
      providers: [
        TranslateService,
        { provide: Router, useValue: routerSpy },
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: UIStatusService, useValue: uiServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
