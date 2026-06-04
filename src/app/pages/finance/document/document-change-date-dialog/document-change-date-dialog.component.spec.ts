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
import { AuthService, FinanceOdataService, HomeDefOdataService, UIStatusService } from '@services/index';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { DocumentChangeDateDialogComponent } from './document-change-date-dialog.component';
import { UserAuthInfo } from '@model/index';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

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

    storageService = createSpyObj('FinanceOdataService', ['changeDocumentDateViaPatch']);
    changeDocumentDateViaPatchSpy = storageService.changeDocumentDateViaPatch.and.returnValue(of([]));
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
                nzContent: DocumentChangeDateDialogComponent,
            }),
            deps: [NzModalService],
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentChangeDateDialogComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form values from inputs on init', () => {
    component.documentid = 123;
    component.documentdate = new Date(2024, 0, 15);
    fixture.detectChanges();
    // idControl is disabled, so getValue() returns the wrapped value
    expect(component.headerFormGroup.get('idControl')?.getRawValue()).toBe(123);
  });

  it('should return true for isSubmittedDisabled when form is invalid', () => {
    component.headerFormGroup.get('dateControl')?.setValue(null);
    expect(component.isSubmittedDisabled).toBe(true);
  });

  it('should return true for isSubmittedDisabled when isSubmitting is true', () => {
    component.headerFormGroup.get('dateControl')?.setValue(new Date());
    component.isSubmitting = true;
    expect(component.isSubmittedDisabled).toBe(true);
  });

  it('should call changeDocumentDateViaPatch on valid submit', () => {
    component.documentid = 123;
    component.headerFormGroup.get('dateControl')?.setValue(new Date(2024, 0, 15));
    component.onSubmit();
    expect(changeDocumentDateViaPatchSpy).toHaveBeenCalled();
  });

  it('should call modal.destroy on cancel', () => {
    const destroySpy = vi.spyOn(TestBed.inject(NzModalRef), 'destroy');
    component.onCancel();
    expect(destroySpy).toHaveBeenCalled();
  });

  it('should reset isSubmitting on submit error', () => {
    component.documentid = 123;
    component.headerFormGroup.get('dateControl')?.setValue(new Date(2024, 0, 15));
    changeDocumentDateViaPatchSpy.and.returnValue({
      subscribe: (callbacks: SafeAny) => callbacks.error?.('server error'),
    });
    component.onSubmit();
    expect(component.isSubmitting).toBe(false);
  });
});
