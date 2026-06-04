import { ComponentFixture, TestBed} from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BehaviorSubject, of } from 'rxjs';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import {createSpyObj, getTranslocoModule, FakeDataHelper} from '../../../../../testing';

import { DocumentChangeDespDialogComponent } from './document-change-desp-dialog.component';
import { AuthService, FinanceOdataService, HomeDefOdataService, UIStatusService } from '@services/index';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { UserAuthInfo } from '@model/index';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DocumentChangeDespDialogComponent', () => {
  let component: DocumentChangeDespDialogComponent;
  let fixture: ComponentFixture<DocumentChangeDespDialogComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let changeDocumentDespViaPatchSpy: SafeAny;
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

    storageService = createSpyObj('FinanceOdataService', ['changeDocumentDespViaPatch']);
    changeDocumentDespViaPatchSpy = storageService.changeDocumentDespViaPatch.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    homeServiceStub.ChosedHome = fakeData.chosedHome;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    // declarations moved to imports
    imports: [FormsModule,
        
        ReactiveFormsModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        RouterTestingModule,
        getTranslocoModule()],
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
                nzContent: DocumentChangeDespDialogComponent,
            }),
            deps: [NzModalService],
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentChangeDespDialogComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form values from inputs on init', () => {
    component.documentid = 456;
    component.documentdesp = 'Test description';
    fixture.detectChanges();
    expect(component.headerFormGroup.get('despControl')?.value).toBe('Test description');
  });

  it('should return true for isSubmittedDisabled when form is invalid', () => {
    component.headerFormGroup.get('despControl')?.setValue('');
    expect(component.isSubmittedDisabled).toBe(true);
  });

  it('should return true for isSubmittedDisabled when isSubmitting is true', () => {
    component.headerFormGroup.get('despControl')?.setValue('Some description');
    component.isSubmitting = true;
    expect(component.isSubmittedDisabled).toBe(true);
  });

  it('should call changeDocumentDespViaPatch on valid submit', () => {
    component.documentid = 456;
    component.headerFormGroup.get('despControl')?.setValue('New description');
    component.onSubmit();
    expect(changeDocumentDespViaPatchSpy).toHaveBeenCalled();
  });

  it('should call modal.destroy on cancel', () => {
    const destroySpy = vi.spyOn(TestBed.inject(NzModalRef), 'destroy');
    component.onCancel();
    expect(destroySpy).toHaveBeenCalled();
  });

  it('should reset isSubmitting on submit error', () => {
    component.documentid = 456;
    component.headerFormGroup.get('despControl')?.setValue('New description');
    changeDocumentDespViaPatchSpy.and.returnValue({
      subscribe: (callbacks: SafeAny) => callbacks.error?.('server error'),
    });
    component.onSubmit();
    expect(component.isSubmitting).toBe(false);
  });
});
