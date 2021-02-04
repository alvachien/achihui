import { waitForAsync, ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { en_US, NZ_I18N, zh_CN } from 'ng-zorro-antd/i18n';
import { BehaviorSubject } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { UIMode } from 'actslib';

import { FinanceUIModule } from '../../finance-ui.module';
import { DocumentHeaderComponent } from './document-header.component';
import { getTranslocoModule, FakeDataHelper, FormGroupHelper } from '../../../../../testing';
import { AuthService, UIStatusService, } from '../../../../services';
import { UserAuthInfo, financeDocTypeNormal, financeDocTypeCurrencyExchange, Document } from '../../../../model';

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

  beforeEach(waitForAsync(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        FinanceUIModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        getTranslocoModule(),
      ],
      declarations: [ DocumentHeaderComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: Router, useValue: routerSpy },
        { provide: NZ_I18N, useValue: en_US },
      ]
    })
    .compileComponents();
  }));

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
    let overlayContainerElement: HTMLElement;
    let curDocument: Document;

    beforeEach(() => {
      component.docType = financeDocTypeNormal;
      component.arCurrencies = fakeData.currencies;
      component.arDocTypes = fakeData.finDocTypes;
      component.currentUIMode = UIMode.Update;
      component.baseCurrency = fakeData.chosedHome.BaseCurrency;
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('Tran date is mandatory', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.headerForm.get('currControl').value).toEqual(fakeData.chosedHome.BaseCurrency);

      component.headerForm.get('dateControl').setValue('');
      component.headerForm.get('despControl').setValue('test');
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0).key).toEqual('dateControl');
    }));

    it('Desp is mandatory', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();

      component.headerForm.get('dateControl').setValue(new Date());
      fixture.detectChanges();
      component.onChange();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0).key).toEqual('despControl');
    }));

    it('Currency is mandatory', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();

      component.headerForm.get('dateControl').setValue(new Date());
      component.headerForm.get('despControl').setValue('test');
      component.headerForm.get('currControl').setValue('');
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0).key).toEqual('currControl');
    }));

    it('shall show exchange rate for foreign currency', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('#idexg')).length).toEqual(0);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan')).length).toEqual(0);

      // Input foreign currency
      component.headerForm.get('currControl').setValue('USD');
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('#idexg')).length).toEqual(1);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan')).length).toEqual(1);
    }));

    it('Exchange rate is mandatory for foreign currency', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input foreign currency
      component.headerForm.get('dateControl').setValue(new Date());
      component.headerForm.get('despControl').setValue('test');
      component.headerForm.get('currControl').setValue('USD');
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0).key).toEqual('exgControl');
      expect(errors.GetElement(0).error).toEqual('required');

      // Input exchange rate
      component.headerForm.get('exgControl').setValue('300');
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeTruthy();
    }));

    it('OnChange method', fakeAsync(() => {
      const changefn = () => {};
      component.registerOnChange(changefn);
      spyOn(component, 'onChange').and.callThrough();

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.onChange).toHaveBeenCalledTimes(0);

      // Date
      component.headerForm.get('dateControl').setValue(new Date());
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(1);
      // Desp
      component.headerForm.get('despControl').setValue('Test');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(2);
      // Currency
      component.headerForm.get('currControl').setValue('USD');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(3);
      // Exchange rate
      component.headerForm.get('exgControl').setValue('300');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(4);
      // Planned exchange rate
      component.headerForm.get('exgpControl').setValue(true);
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(5);
    }));

    it('it shall return correct Document object', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input foreign currency
      component.headerForm.get('dateControl').setValue(new Date(2020, 2, 2));
      component.headerForm.get('despControl').setValue('test');
      component.headerForm.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      fixture.detectChanges();

      curDocument = component.value;
      expect(curDocument).toBeTruthy();
      expect(curDocument.DocType).toEqual(financeDocTypeNormal);
      expect(curDocument.Desp).toEqual('test');
      expect(curDocument.TranCurr).toEqual(fakeData.chosedHome.BaseCurrency);
      expect(curDocument.TranDate).toBeTruthy();
      expect(curDocument.TranDate.year()).toEqual(2020);
      expect(curDocument.TranDate.month()).toEqual(2);
      expect(curDocument.TranDate.date()).toEqual(2);
    }));

    it('it shall return correct Document object with foreign currency', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input foreign currency
      component.headerForm.get('dateControl').setValue(new Date(2020, 2, 2));
      component.headerForm.get('despControl').setValue('Test');
      component.headerForm.get('currControl').setValue('USD');
      component.headerForm.get('exgControl').setValue(624.22);
      fixture.detectChanges();

      curDocument = component.value;
      expect(curDocument).toBeTruthy();
      expect(curDocument.DocType).toEqual(financeDocTypeNormal);
      expect(curDocument.Desp).toEqual('Test');
      expect(curDocument.TranCurr).toEqual('USD');
      expect(curDocument.TranDate).toBeTruthy();
      expect(curDocument.TranDate.year()).toEqual(2020);
      expect(curDocument.TranDate.month()).toEqual(2);
      expect(curDocument.TranDate.date()).toEqual(2);
      expect(curDocument.ExgRate).toEqual(624.22);
      expect(curDocument.ExgRate_Plan).toBeFalsy();
    }));
  });

  describe('Disable mode for normal document', () => {
    beforeEach(fakeAsync(() => {
      component.arCurrencies = fakeData.currencies;
      component.arDocTypes = fakeData.finDocTypes;

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit

      component.currentUIMode = UIMode.Display;
      component.baseCurrency = fakeData.chosedHome.BaseCurrency;
      fixture.detectChanges();
      component.docType = financeDocTypeNormal;
    }));

    it('shall be readonly', fakeAsync(() => {
      expect(component.headerForm.disabled).toBeTruthy();
    }));
  });

  describe('Enable Mode for currency exchange document', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let curDocument: Document;

    beforeEach(() => {
      component.arCurrencies = fakeData.currencies;
      component.arDocTypes = fakeData.finDocTypes;
      component.currentUIMode = UIMode.Update;
      component.docType = financeDocTypeCurrencyExchange;
      component.baseCurrency = fakeData.chosedHome.BaseCurrency;
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall show exchange rate for second foreign currency', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      component.docType = financeDocTypeCurrencyExchange;
      component.baseCurrency = fakeData.chosedHome.BaseCurrency;
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('#idexg2')).length).toEqual(0);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan2')).length).toEqual(0);

      // Input foreign currency
      component.headerForm.get('curr2Control').setValue('USD');
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('#idexg2')).length).toEqual(1);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan2')).length).toEqual(1);
    }));

    it('Currency is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      component.docType = financeDocTypeCurrencyExchange;
      component.baseCurrency = fakeData.chosedHome.BaseCurrency;
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();

      component.headerForm.get('dateControl').setValue(new Date());
      component.headerForm.get('despControl').setValue('test');
      component.headerForm.get('currControl').setValue('');
      component.headerForm.get('curr2Control').setValue('USD');
      component.headerForm.get('exg2Control').setValue(600);
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0).key).toEqual('currControl');
    }));

    it('Currency2 is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      expect(component.isFieldChangable).toBeTruthy();

      component.headerForm.get('dateControl').setValue(new Date());
      component.headerForm.get('despControl').setValue('test');
      component.headerForm.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      component.headerForm.get('curr2Control').setValue('');
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0).key).toEqual('curr2Control');
      expect(errors.GetElement(0).error).toEqual('required');
    }));
    it('Currency must be diff', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      expect(component.isFieldChangable).toBeTruthy();

      component.headerForm.get('dateControl').setValue(new Date());
      component.headerForm.get('despControl').setValue('test');
      component.headerForm.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      component.headerForm.get('curr2Control').setValue(fakeData.chosedHome.BaseCurrency);
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0).key).toEqual('curr2Control');
      expect(errors.GetElement(0).error).toEqual('currencyMustDiff');
    }));
    it('Exgrate2 is mandatory if currency 2 is foreign', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      component.docType = financeDocTypeCurrencyExchange;
      component.baseCurrency = fakeData.chosedHome.BaseCurrency;
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();

      component.headerForm.get('dateControl').setValue(new Date());
      component.headerForm.get('despControl').setValue('test');
      component.headerForm.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      component.headerForm.get('curr2Control').setValue('USD');
      fixture.detectChanges();

      expect(component.headerForm.valid).toBeFalsy();
      const errors = FormGroupHelper.getFormGroupError(component.headerForm);
      expect(errors.Length()).toEqual(1);
      expect(errors.GetElement(0).key).toEqual('exg2Control');
      expect(errors.GetElement(0).error).toEqual('required');
    }));

    it('OnChange method', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const changefn = () => {};
      component.registerOnChange(changefn);
      spyOn(component, 'onChange').and.callThrough();

      // Date
      expect(component.onChange).toHaveBeenCalledTimes(0);
      component.headerForm.get('dateControl').setValue(new Date());
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(1);
      // Desp
      component.headerForm.get('despControl').setValue('Test');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(2);
      // Currency
      component.headerForm.get('currControl').setValue('USD');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(3);
      // Exchange rate
      component.headerForm.get('exgControl').setValue('300');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(4);
      // Planned exchange rate
      component.headerForm.get('exgpControl').setValue(true);
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(5);
      // Currency 2
      component.headerForm.get('curr2Control').setValue('EUR');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(6);
      // Exchange rate 2
      component.headerForm.get('exg2Control').setValue('200');
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(7);
      // Planned exchange rate 2
      component.headerForm.get('exgp2Control').setValue(true);
      fixture.detectChanges();
      expect(component.onChange).toHaveBeenCalledTimes(8);
    }));

    it('it shall return correct Document object', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input foreign currency
      component.headerForm.get('dateControl').setValue(new Date(2020, 2, 2));
      component.headerForm.get('despControl').setValue('test');
      component.headerForm.get('currControl').setValue(fakeData.chosedHome.BaseCurrency);
      component.headerForm.get('curr2Control').setValue('USD');
      component.headerForm.get('exg2Control').setValue(634.56);
      fixture.detectChanges();

      curDocument = component.value;
      expect(curDocument).toBeTruthy();
      expect(curDocument.DocType).toEqual(financeDocTypeCurrencyExchange);
      expect(curDocument.Desp).toEqual('test');
      expect(curDocument.TranCurr).toEqual(fakeData.chosedHome.BaseCurrency);
      expect(curDocument.TranDate).toBeTruthy();
      expect(curDocument.TranDate.year()).toEqual(2020);
      expect(curDocument.TranDate.month()).toEqual(2);
      expect(curDocument.TranDate.date()).toEqual(2);
      expect(curDocument.TranCurr2).toEqual('USD');
      expect(curDocument.ExgRate2).toEqual(634.56);
    }));

    it('it shall return correct Document object with foreign currency', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Input foreign currency
      component.headerForm.get('dateControl').setValue(new Date(2020, 2, 2));
      component.headerForm.get('despControl').setValue('Test');
      component.headerForm.get('currControl').setValue('USD');
      component.headerForm.get('exgControl').setValue(624.22);
      component.headerForm.get('curr2Control').setValue('EUR');
      component.headerForm.get('exg2Control').setValue(666.56);
      component.headerForm.get('exgp2Control').setValue(true);
      fixture.detectChanges();

      curDocument = component.value;
      expect(curDocument).toBeTruthy();
      expect(curDocument.DocType).toEqual(financeDocTypeCurrencyExchange);
      expect(curDocument.Desp).toEqual('Test');
      expect(curDocument.TranCurr).toEqual('USD');
      expect(curDocument.TranDate).toBeTruthy();
      expect(curDocument.TranDate.year()).toEqual(2020);
      expect(curDocument.TranDate.month()).toEqual(2);
      expect(curDocument.TranDate.date()).toEqual(2);
      expect(curDocument.ExgRate).toEqual(624.22);
      expect(curDocument.ExgRate_Plan).toBeFalsy();
      expect(curDocument.TranCurr2).toEqual('EUR');
      expect(curDocument.ExgRate2).toEqual(666.56);
      expect(curDocument.ExgRate_Plan2).toBeTruthy();
    }));
  });
});
