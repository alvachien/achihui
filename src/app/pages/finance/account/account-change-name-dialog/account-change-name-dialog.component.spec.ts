import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { createSpyObj, getTranslocoModule, FakeDataHelper } from '../../../../../testing';
import { AccountChangeNameDialogComponent } from './account-change-name-dialog.component';
import { AuthService, FinanceOdataService, HomeDefOdataService, UIStatusService } from '@services/index';
import { UserAuthInfo } from '@model/index';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('AccountChangeNameDialogComponent', () => {
  let component: AccountChangeNameDialogComponent;
  let fixture: ComponentFixture<AccountChangeNameDialogComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let changeAccountByPatchSpy: SafeAny;
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

    storageService = createSpyObj('FinanceOdataService', ['changeAccountByPatch']);
    changeAccountByPatchSpy = storageService.changeAccountByPatch.and.returnValue(of([]));
    authServiceStub.authSubject = signal(new UserAuthInfo());
    homeServiceStub.ChosedHome = fakeData.chosedHome;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, getTranslocoModule()],
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
              nzContent: AccountChangeNameDialogComponent,
            }),
          deps: [NzModalService],
        },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountChangeNameDialogComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form values from inputs on init', () => {
    fixture.componentRef.setInput('accountid', 100);
    fixture.componentRef.setInput('name', 'Test Account');
    fixture.componentRef.setInput('comment', 'Test Comment');
    fixture.detectChanges();
    expect(component.headerFormGroup.get('nameControl')?.value).toBe('Test Account');
    expect(component.headerFormGroup.get('cmtControl')?.value).toBe('Test Comment');
  });

  it('should return true for isSubmittedDisabled when form is invalid', () => {
    component.headerFormGroup.get('nameControl')?.setValue('');
    expect(component.isSubmittedDisabled).toBe(true);
  });

  it('should return true for isSubmittedDisabled when isSubmitting is true', () => {
    component.headerFormGroup.get('nameControl')?.setValue('Valid Name');
    component.isSubmitting.set(true);
    expect(component.isSubmittedDisabled).toBe(true);
  });

  it('should call changeAccountByPatch on valid submit', () => {
    fixture.componentRef.setInput('accountid', 100);
    component.headerFormGroup.get('nameControl')?.setValue('New Name');
    component.headerFormGroup.get('nameControl')?.markAsDirty();
    component.onSubmit();
    expect(changeAccountByPatchSpy).toHaveBeenCalled();
  });

  it('should call modal.destroy on cancel', () => {
    const destroySpy = vi.spyOn(TestBed.inject(NzModalRef), 'destroy');
    component.onCancel();
    expect(destroySpy).toHaveBeenCalled();
  });

  it('should reset isSubmitting on submit error', () => {
    fixture.componentRef.setInput('accountid', 100);
    component.headerFormGroup.get('nameControl')?.setValue('New Name');
    component.headerFormGroup.get('nameControl')?.markAsDirty();
    changeAccountByPatchSpy.and.returnValue({
      subscribe: (callbacks: SafeAny) => callbacks.error?.('server error'),
    });
    component.onSubmit();
    expect(component.isSubmitting()).toBe(false);
  });
});
