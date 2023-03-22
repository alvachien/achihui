import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BehaviorSubject, of } from 'rxjs';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { FinanceUIModule } from '../../finance-ui.module';
import { getTranslocoModule, FakeDataHelper } from '../../../../../testing';
import { AuthService, FinanceOdataService, HomeDefOdataService, UIStatusService } from 'src/app/services';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { DocumentChangeDateDialogComponent } from './document-change-date-dialog.component';
import { UserAuthInfo } from 'src/app/model';
import { SafeAny } from 'src/common';

describe('DocumentChangeDateDialogComponent', () => {
  let component: DocumentChangeDateDialogComponent;
  let fixture: ComponentFixture<DocumentChangeDateDialogComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let changeDocumentDateViaPatchSpy: SafeAny;
  const homeServiceStub: Partial<HomeDefOdataService> = {};
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();

    storageService = jasmine.createSpyObj('FinanceOdataService', ['changeDocumentDateViaPatch']);
    changeDocumentDateViaPatchSpy = storageService.changeDocumentDateViaPatch.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    homeServiceStub.ChosedHome = fakeData.chosedHome;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        FinanceUIModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      declarations: [DocumentChangeDateDialogComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
        {
          provide: NzModalRef,
          useFactory: (modalSvc: NzModalService) =>
            modalSvc.create({
              nzClosable: true,
              nzContent: DocumentChangeDateDialogComponent,
            }),
          deps: [NzModalService],
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentChangeDateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
