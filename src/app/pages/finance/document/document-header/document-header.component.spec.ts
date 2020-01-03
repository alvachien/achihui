import { async, ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { NgZorroAntdModule, en_US, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { BehaviorSubject } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';

import { DocumentHeaderComponent } from './document-header.component';
import { getTranslocoModule, FakeDataHelper, FormGroupHelper } from '../../../../../testing';
import { AuthService, UIStatusService, } from '../../../../services';
import { UserAuthInfo, financeDocTypeNormal, UIMode, financeDocTypeCurrencyExchange } from '../../../../model';

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

  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    uiServiceStub.getUILabel = (le: any) => '';
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        NgZorroAntdModule,
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
      component.currentUIMode = UIMode.Change;
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
  });

  describe('Enable Mode for currency exchange document', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let curDocument: Document;

    beforeEach(() => {
      component.docType = financeDocTypeCurrencyExchange;
      component.arCurrencies = fakeData.currencies;
      component.arDocTypes = fakeData.finDocTypes;
      component.currentUIMode = UIMode.Change;
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

      expect(fixture.debugElement.queryAll(By.css('#idexg2')).length).toEqual(0);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan2')).length).toEqual(0);

      // Input foreign currency
      component.headerForm.get('curr2Control').setValue('USD');
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('#idexg2')).length).toEqual(1);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan2')).length).toEqual(1);
    }));

    it('OnChange method', fakeAsync(() => {
      const changefn = () => {};
      component.registerOnChange(changefn);
      spyOn(component, 'onChange').and.callThrough();

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();

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
  });
});
