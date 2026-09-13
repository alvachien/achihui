import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { UIMode } from 'actslib';

import { DocumentHeaderComponent } from './document-header.component';
import { createSpyObj, getTranslocoModule, FakeDataHelper, FormGroupHelper } from '../../../../../testing';
import { AuthService, UIStatusService } from '../../../../services';
import { UserAuthInfo, financeDocTypeNormal, financeDocTypeCurrencyExchange, Document } from '../../../../model';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('DocumentHeaderComponent', () => {
  let component: DocumentHeaderComponent;
  let fixture: ComponentFixture<DocumentHeaderComponent>;
  let fakeData: FakeDataHelper;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
  });

  beforeEach(async () => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = signal(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    const routerSpy = createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [
        FormsModule,

        ReactiveFormsModule,
        getTranslocoModule(),
        NzFormModule,
        NzSelectModule,
        NzInputModule,
        NzInputNumberModule,
        NzDatePickerModule,
        NzCheckboxModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: Router, useValue: routerSpy },
        { provide: NZ_I18N, useValue: en_US },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentHeaderComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Enable Mode for normal document', () => {
    let overlayContainer: OverlayContainer;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let overlayContainerElement: HTMLElement;
    let curDocument: Document;

    beforeEach(() => {
      component.docType = financeDocTypeNormal;
      component.arCurrencies = fakeData.currencies;
      component.arDocTypes = fakeData.finDocTypes;
      component.currentUIMode = UIMode.Update;
      component.baseCurrency = fakeData.chosedHome.BaseCurrency;
    });

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('Tran date is mandatory', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.headerForm.get('currControl')?.value).toEqual(fakeData.chosedHome.BaseCurrency);

      component.headerForm.get('dateControl')?.setValue('');
      component.headerForm.get('despControl')?.setValue('test');
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0)?.key).toEqual('dateControl');
    });

    it('Desp is mandatory', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();

      component.headerForm.get('dateControl')?.setValue(new Date());
      fixture.detectChanges();
      component.onChange();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0)?.key).toEqual('despControl');
    });

    it('Currency is mandatory', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();

      component.headerForm.get('dateControl')?.setValue(new Date());
      component.headerForm.get('despControl')?.setValue('test');
      component.headerForm.get('currControl')?.setValue('');
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0)?.key).toEqual('currControl');
    });

    it('shall show exchange rate for foreign currency', async () => {
      fixture.detectChanges(); // ngOnInit

      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('#idexg')).length).toEqual(0);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan')).length).toEqual(0);

      // Input foreign currency
      component.headerForm.get('currControl')?.setValue('USD');
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('#idexg')).length).toEqual(1);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan')).length).toEqual(1);
    });

    it('Exchange rate is mandatory for foreign currency', async () => {
      fixture.detectChanges(); // ngOnInit

      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input foreign currency
      component.headerForm.get('dateControl')?.setValue(new Date());
      component.headerForm.get('despControl')?.setValue('test');
      component.headerForm.get('currControl')?.setValue('USD');
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0)?.key).toEqual('exgControl');
      expect(errors.GetElement(0)?.error).toEqual('required');

      // Input exchange rate
      component.headerForm.get('exgControl')?.setValue('300');
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeTruthy();
    });

    it('OnChange method', async () => {
      const changefn = () => {
        // TBD.
      };
      component.registerOnChange(changefn);
      vi.spyOn(component, 'onChange');

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.onChange).toHaveBeenCalledTimes(0);

      // Date
      component.headerForm.get('dateControl')?.setValue(new Date());
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(1);
      // Desp
      component.headerForm.get('despControl')?.setValue('Test');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(2);
      // Currency
      component.headerForm.get('currControl')?.setValue('USD');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(3);
      // Exchange rate
      component.headerForm.get('exgControl')?.setValue('300');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(4);
      // Planned exchange rate
      component.headerForm.get('exgpControl')?.setValue(true);
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(5);
    });

    it('it shall return correct Document object', async () => {
      fixture.detectChanges(); // ngOnInit

      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input foreign currency
      component.headerForm.get('dateControl')?.setValue(new Date(2020, 2, 2));
      component.headerForm.get('despControl')?.setValue('test');
      component.headerForm.get('currControl')?.setValue(fakeData.chosedHome.BaseCurrency);
      fixture.detectChanges();

      curDocument = component.value;
      expect(curDocument).toBeTruthy();
      expect(curDocument.DocType).toEqual(financeDocTypeNormal);
      expect(curDocument.Desp).toEqual('test');
      expect(curDocument.TranCurr).toEqual(fakeData.chosedHome.BaseCurrency);
      expect(curDocument.TranDate).toBeTruthy();
      expect(curDocument.TranDate.getFullYear()).toEqual(2020);
      expect(curDocument.TranDate.getMonth()).toEqual(2);
      expect(curDocument.TranDate.getDate()).toEqual(2);
    });

    it('it shall return correct Document object with foreign currency', async () => {
      fixture.detectChanges(); // ngOnInit

      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input foreign currency
      component.headerForm.get('dateControl')?.setValue(new Date(2020, 2, 2));
      component.headerForm.get('despControl')?.setValue('Test');
      component.headerForm.get('currControl')?.setValue('USD');
      component.headerForm.get('exgControl')?.setValue(624.22);
      fixture.detectChanges();

      curDocument = component.value;
      expect(curDocument).toBeTruthy();
      expect(curDocument.DocType).toEqual(financeDocTypeNormal);
      expect(curDocument.Desp).toEqual('Test');
      expect(curDocument.TranCurr).toEqual('USD');
      expect(curDocument.TranDate).toBeTruthy();
      expect(curDocument.TranDate.getFullYear()).toEqual(2020);
      expect(curDocument.TranDate.getMonth()).toEqual(2);
      expect(curDocument.TranDate.getDate()).toEqual(2);
      expect(curDocument.ExgRate).toEqual(624.22);
      expect(curDocument.ExgRate_Plan).toBeFalsy();
    });
  });

  describe('Disable mode for normal document', () => {
    beforeEach(async () => {
      component.arCurrencies = fakeData.currencies;
      component.arDocTypes = fakeData.finDocTypes;

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit

      component.currentUIMode = UIMode.Display;
      component.baseCurrency = fakeData.chosedHome.BaseCurrency;
      fixture.detectChanges();
      component.docType = financeDocTypeNormal;
    });

    it('shall be readonly', async () => {
      expect(component.headerForm.disabled).toBeTruthy();
    });
  });

  describe('Enable Mode for currency exchange document', () => {
    let overlayContainer: OverlayContainer;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let overlayContainerElement: HTMLElement;
    let curDocument: Document;

    beforeEach(() => {
      component.arCurrencies = fakeData.currencies;
      component.arDocTypes = fakeData.finDocTypes;
      component.currentUIMode = UIMode.Update;
      component.docType = financeDocTypeCurrencyExchange;
      component.baseCurrency = fakeData.chosedHome.BaseCurrency;
    });

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall show exchange rate for second foreign currency', async () => {
      fixture.detectChanges(); // ngOnInit

      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      component.docType = financeDocTypeCurrencyExchange;
      component.baseCurrency = fakeData.chosedHome.BaseCurrency;
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('#idexg2')).length).toEqual(0);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan2')).length).toEqual(0);

      // Input foreign currency
      component.headerForm.get('curr2Control')?.setValue('USD');
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('#idexg2')).length).toEqual(1);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan2')).length).toEqual(1);
    });

    it('Currency is mandatory', async () => {
      fixture.detectChanges(); // ngOnInit

      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      component.docType = financeDocTypeCurrencyExchange;
      component.baseCurrency = fakeData.chosedHome.BaseCurrency;
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();

      component.headerForm.get('dateControl')?.setValue(new Date());
      component.headerForm.get('despControl')?.setValue('test');
      component.headerForm.get('currControl')?.setValue('');
      component.headerForm.get('curr2Control')?.setValue('USD');
      component.headerForm.get('exg2Control')?.setValue(600);
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0)?.key).toEqual('currControl');
    });

    it('Currency2 is mandatory', async () => {
      fixture.detectChanges(); // ngOnInit

      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      expect(component.isFieldChangable).toBeTruthy();

      component.headerForm.get('dateControl')?.setValue(new Date());
      component.headerForm.get('despControl')?.setValue('test');
      component.headerForm.get('currControl')?.setValue(fakeData.chosedHome.BaseCurrency);
      component.headerForm.get('curr2Control')?.setValue('');
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0)?.key).toEqual('curr2Control');
      expect(errors.GetElement(0)?.error).toEqual('required');
    });
    it('Currency must be diff', async () => {
      fixture.detectChanges(); // ngOnInit

      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      expect(component.isFieldChangable).toBeTruthy();

      component.headerForm.get('dateControl')?.setValue(new Date());
      component.headerForm.get('despControl')?.setValue('test');
      component.headerForm.get('currControl')?.setValue(fakeData.chosedHome.BaseCurrency);
      component.headerForm.get('curr2Control')?.setValue(fakeData.chosedHome.BaseCurrency);
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0)?.key).toEqual('curr2Control');
      expect(errors.GetElement(0)?.error).toEqual('currencyMustDiff');
    });
    it('Exgrate2 is mandatory if currency 2 is foreign', async () => {
      fixture.detectChanges(); // ngOnInit

      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      component.docType = financeDocTypeCurrencyExchange;
      component.baseCurrency = fakeData.chosedHome.BaseCurrency;
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();

      component.headerForm.get('dateControl')?.setValue(new Date());
      component.headerForm.get('despControl')?.setValue('test');
      component.headerForm.get('currControl')?.setValue(fakeData.chosedHome.BaseCurrency);
      component.headerForm.get('curr2Control')?.setValue('USD');
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0)?.key).toEqual('exg2Control');
      expect(errors.GetElement(0)?.error).toEqual('required');
    });

    it('OnChange method', async () => {
      fixture.detectChanges(); // ngOnInit

      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const changefn = () => {
        // TBD.
      };
      component.registerOnChange(changefn);
      vi.spyOn(component, 'onChange');

      // Date
      expect(component.onChange).toHaveBeenCalledTimes(0);
      component.headerForm.get('dateControl')?.setValue(new Date());
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(1);
      // Desp
      component.headerForm.get('despControl')?.setValue('Test');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(2);
      // Currency
      component.headerForm.get('currControl')?.setValue('USD');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(3);
      // Exchange rate
      component.headerForm.get('exgControl')?.setValue('300');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(4);
      // Planned exchange rate
      component.headerForm.get('exgpControl')?.setValue(true);
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(5);
      // Currency 2
      component.headerForm.get('curr2Control')?.setValue('EUR');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(6);
      // Exchange rate 2
      component.headerForm.get('exg2Control')?.setValue('200');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(7);
      // Planned exchange rate 2
      component.headerForm.get('exgp2Control')?.setValue(true);
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(8);
    });

    it('it shall return correct Document object', async () => {
      fixture.detectChanges(); // ngOnInit

      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input foreign currency
      component.headerForm.get('dateControl')?.setValue(new Date(2020, 2, 2));
      component.headerForm.get('despControl')?.setValue('test');
      component.headerForm.get('currControl')?.setValue(fakeData.chosedHome.BaseCurrency);
      component.headerForm.get('curr2Control')?.setValue('USD');
      component.headerForm.get('exg2Control')?.setValue(634.56);
      fixture.detectChanges();

      curDocument = component.value;
      expect(curDocument).toBeTruthy();
      expect(curDocument.DocType).toEqual(financeDocTypeCurrencyExchange);
      expect(curDocument.Desp).toEqual('test');
      expect(curDocument.TranCurr).toEqual(fakeData.chosedHome.BaseCurrency);
      expect(curDocument.TranDate).toBeTruthy();
      expect(curDocument.TranDate.getFullYear()).toEqual(2020);
      expect(curDocument.TranDate.getMonth()).toEqual(2);
      expect(curDocument.TranDate.getDate()).toEqual(2);
      expect(curDocument.TranCurr2).toEqual('USD');
      expect(curDocument.ExgRate2).toEqual(634.56);
    });

    it('it shall return correct Document object with foreign currency', async () => {
      fixture.detectChanges(); // ngOnInit

      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input foreign currency
      component.headerForm.get('dateControl')?.setValue(new Date(2020, 2, 2));
      component.headerForm.get('despControl')?.setValue('Test');
      component.headerForm.get('currControl')?.setValue('USD');
      component.headerForm.get('exgControl')?.setValue(624.22);
      component.headerForm.get('curr2Control')?.setValue('EUR');
      component.headerForm.get('exg2Control')?.setValue(666.56);
      component.headerForm.get('exgp2Control')?.setValue(true);
      fixture.detectChanges();

      curDocument = component.value;
      expect(curDocument).toBeTruthy();
      expect(curDocument.DocType).toEqual(financeDocTypeCurrencyExchange);
      expect(curDocument.Desp).toEqual('Test');
      expect(curDocument.TranCurr).toEqual('USD');
      expect(curDocument.TranDate).toBeTruthy();
      expect(curDocument.TranDate.getFullYear()).toEqual(2020);
      expect(curDocument.TranDate.getMonth()).toEqual(2);
      expect(curDocument.TranDate.getDate()).toEqual(2);
      expect(curDocument.ExgRate).toEqual(624.22);
      expect(curDocument.ExgRate_Plan).toBeFalsy();
      expect(curDocument.TranCurr2).toEqual('EUR');
      expect(curDocument.ExgRate2).toEqual(666.56);
      expect(curDocument.ExgRate_Plan2).toBeTruthy();
    });
  });

  describe('Currency must be defined in the catalog (create step-1 gating)', () => {
    beforeEach(() => {
      component.currentUIMode = UIMode.Create;
      component.docType = financeDocTypeNormal;
      component.arCurrencies = fakeData.currencies;
    });

    it('flags the home base-currency stamp when the catalog does not define it', () => {
      // Data drift: the home was set up with 'GBP' but the catalog defines
      // CNY/USD/EUR only. The baseCurrency setter stamps GBP - 'required'
      // passes, the catalog check must not.
      component.baseCurrency = 'GBP';
      const ctl = component.headerForm.get('currControl');
      expect(ctl?.value).toBe('GBP');
      expect(ctl?.hasError('invalidCurrency')).toBe(true);

      // A code the catalog defines passes.
      ctl?.setValue('USD');
      ctl?.updateValueAndValidity();
      expect(ctl?.hasError('invalidCurrency')).toBeFalsy();
    });

    it('validate() propagates child failures to the hosting (wizard) control', () => {
      // Stamps a defined currency (so only the description keeps the inner
      // group invalid - a CHILD error with no GROUP-level errors): validate()
      // must still say "invalid" or step gating stays green.
      component.baseCurrency = 'CNY';
      expect(component.validate(new UntypedFormControl(null))).toEqual({ headerFormInvalid: true });

      component.headerForm.get('despControl')?.setValue('filled in');
      expect(component.validate(new UntypedFormControl(null))).toBeNull();
    });

    it('an arriving catalog re-validates a stale stamp and notifies the hosting control', () => {
      component.baseCurrency = 'CNY';
      expect(component.headerForm.get('currControl')?.hasError('invalidCurrency')).toBeFalsy();

      const revalidateSpy = vi.fn();
      component.registerOnValidatorChange(revalidateSpy);
      const changeSpy = vi.fn();
      component.registerOnChange(changeSpy);

      // The fetch completes later with a list that lacks the stamped code.
      component.arCurrencies = fakeData.currencies.filter((c) => c.Currency !== 'CNY');
      expect(component.headerForm.get('currControl')?.hasError('invalidCurrency')).toBe(true);
      // Validator-change hook fired -> the outer control revalidates (step
      // gating updates). onChange must NOT fire: an input setter may not
      // push a value out or dirty the hosting control.
      expect(revalidateSpy).toHaveBeenCalledTimes(1);
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('stays silent while the catalog has not loaded (no false invalid flash)', () => {
      // Fresh instance: no arCurrencies input ever set (fetch pending/failed).
      const freshFixture = TestBed.createComponent(DocumentHeaderComponent);
      const fresh = freshFixture.componentInstance;
      fresh.currentUIMode = UIMode.Create;
      fresh.docType = financeDocTypeNormal;
      fresh.baseCurrency = 'GBP'; // stamped before any catalog arrives
      expect(fresh.headerForm.get('currControl')?.hasError('invalidCurrency')).toBeFalsy();

      // Once a catalog lands, the drift is flagged.
      fresh.arCurrencies = fakeData.currencies; // CNY/USD/EUR only
      expect(fresh.headerForm.get('currControl')?.hasError('invalidCurrency')).toBe(true);
    });

    it('Display mode stays silent even for unknown currencies', () => {
      component.currentUIMode = UIMode.Display;
      component.headerForm.get('currControl')?.setValue('GBP');
      component.headerForm.get('currControl')?.updateValueAndValidity();
      expect(component.validate(new UntypedFormControl(null))).toBeNull();
    });
  });
});
