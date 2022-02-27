import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { FinanceUIModule } from '../../finance-ui.module';
import { getTranslocoModule, FakeDataHelper, FormGroupHelper, ActivatedRouteUrlStub, asyncData, asyncError } from '../../../../../testing';

import { DocumentChangeDespDialogComponent } from './document-change-desp-dialog.component';
import { AuthService, FinanceOdataService, HomeDefOdataService, UIStatusService } from 'src/app/services';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { UserAuthInfo } from 'src/app/model';

describe('DocumentChangeDespDialogComponent', () => {
  let component: DocumentChangeDespDialogComponent;
  let fixture: ComponentFixture<DocumentChangeDespDialogComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let changeDocumentDespViaPatchSpy: any;
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

    storageService = jasmine.createSpyObj('FinanceOdataService', [
      'changeDocumentDespViaPatch',
    ]);
    changeDocumentDespViaPatchSpy = storageService.changeDocumentDespViaPatch.and.returnValue(of([]));
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
      declarations: [ DocumentChangeDespDialogComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
        {
          provide: NzModalRef,
          useFactory: (modalSvc: NzModalService) => modalSvc.create({
            nzClosable: true,
            nzContent: DocumentChangeDespDialogComponent
          }),
          deps: [NzModalService]
        },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentChangeDespDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
