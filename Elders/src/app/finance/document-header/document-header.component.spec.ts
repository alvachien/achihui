import { async, ComponentFixture, TestBed, fakeAsync, inject, tick, flush, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { DocumentHeaderComponent } from './document-header.component';
import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../../../src/testing';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { Document, DocumentType, DocumentItem, financeDocTypeNormal, financeDocTypeCurrencyExchange, UIMode, } from '../../model';

describe('DocumentHeaderComponent', () => {
  let component: DocumentHeaderComponent;
  let fixture: ComponentFixture<DocumentHeaderComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCurrenciesSpy: any;
  let fetchAllDocTypesSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
  });

  beforeEach(async(() => {
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    fetchAllCurrenciesSpy = currService.fetchAllCurrencies.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', ['fetchAllDocTypes']);
    fetchAllDocTypesSpy = storageService.fetchAllDocTypes.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [ DocumentHeaderComponent ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinCurrencyService, useValue: currService },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: FinanceStorageService, useValue: storageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentHeaderComponent);
    component = fixture.componentInstance;
  });

  it('1. should create without data', () => {
    expect(component).toBeTruthy();
  });

  describe('2. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. should display error when accont category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError('currency service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      // fixture.detectChanges();

      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('currency service failed',
        'Expected snack bar to show the error message: currency service failed');

      flush();
    }));
  });

  describe('3. Enable Mode for normal document', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let curDocument: Document;

    beforeEach(() => {
      component.docType = financeDocTypeNormal;
      component.currentUIMode = UIMode.Change;
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. Tran date is mandatory', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.headerForm.get('currControl').value).toEqual(fakeData.chosedHome.BaseCurrency);

      component.headerForm.get('dateControl').setValue('');
      fixture.detectChanges();
      component.onChange();

      expect(component.headerForm.valid).toBeFalsy();
    }));

    it('shall show exchange rate for foreign currency', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('#exgrate')).length).toEqual(0);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan')).length).toEqual(0);

      // Input foreign currency
      component.headerForm.get('currControl').setValue('USD');
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('#exgrate')).length).toEqual(1);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan')).length).toEqual(1);
    }));
  });

  describe('4. Enable Mode for currency exchange document', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let curDocument: Document;

    beforeEach(() => {
      component.docType = financeDocTypeCurrencyExchange;
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));

      // curDocument = new Document();
      // curDocument.Id = 1;
      // curDocument.TranCurr = 'CNY';
      // curDocument.TranCurr2 = 'USD';
      // curDocument.TranDate = moment().add(1, 'M');
      // curDocument.Desp = 'test';
      // curDocument.DocType = financeDocTypeCurrencyExchange;
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

      expect(fixture.debugElement.queryAll(By.css('#exgrate2')).length).toEqual(0);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan2')).length).toEqual(0);

      // Input foreign currency
      component.headerForm.get('curr2Control').setValue('USD');
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('#exgrate2')).length).toEqual(1);
      expect(fixture.debugElement.queryAll(By.css('#exgrate_plan2')).length).toEqual(1);
    }));
  });
});
