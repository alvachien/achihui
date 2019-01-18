import { async, ComponentFixture, fakeAsync, TestBed, tick, inject, flush } from '@angular/core/testing';
import { UIDependModule } from '../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../testing';
import { FinanceCurrencyComponent } from './finance-currency.component';
import { FinCurrencyService } from '../services';

describe('FinanceCurrencyComponent', () => {
  let component: FinanceCurrencyComponent;
  let fixture: ComponentFixture<FinanceCurrencyComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let fetchAllCurrenciesSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    fetchAllCurrenciesSpy = currService.fetchAllCurrencies.and.returnValue(of([]));

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
      declarations: [ FinanceCurrencyComponent ],
      providers: [
        TranslateService,
        { provide: FinCurrencyService, useValue: currService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceCurrencyComponent);
    component = fixture.componentInstance;

    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  it('1. should be created with empty data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.dataSource.data.length).toEqual(0);
  });

  describe('2. faked data with async loading', () => {
    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSource.data.length).toEqual(0);
    });

    it('should show data after OnInit (fakeAsync)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSource.data.length).toEqual(0);

      tick();
      fixture.detectChanges();

      expect(component.dataSource.data.length).toBeGreaterThan(0);
      expect(component.dataSource.data.length).toEqual(fakeData.currencies.length);
    }));

    it('should show data after OnInit (async)', async(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSource.data.length).toEqual(0);

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(component.dataSource.data.length).toBeGreaterThan(0);
        expect(component.dataSource.data.length).toEqual(fakeData.currencies.length);
      });
    }));

    it('should show data after fetchAllCurrencies (spy done)', (done: DoneFn) => {
      fixture.detectChanges();

      // the spy's most recent call returns the observable with the test quote
      fetchAllCurrenciesSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();

        expect(component.dataSource.data.length).toBeGreaterThan(0);
        expect(component.dataSource.data.length).toEqual(fakeData.currencies.length);
        done();
      });
    });

  });

  describe('3. Exception case handling (async loading)', () => {
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

    it('should display error when Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(0);
      flush();

      tick();
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Service failed',
        'Expected snack bar to show the error message: Service failed');
    }));
  });
});
