import { async, ComponentFixture, TestBed, fakeAsync, inject, flush, tick } from '@angular/core/testing';
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

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { TranTypeTreeComponent } from './tran-type-tree.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';

describe('TranTypeTreeComponent', () => {
  let component: TranTypeTreeComponent;
  let fixture: ComponentFixture<TranTypeTreeComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllTranTypesSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildFinConfigData();

    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllTranTypes',
    ]);
    fetchAllTranTypesSpy = stroageService.fetchAllTranTypes.and.returnValue(of([]));

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
      declarations: [
        TranTypeTreeComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinanceStorageService, useValue: stroageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranTypeTreeComponent);
    component = fixture.componentInstance;
  });

  it('1. should be created with empty data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.dataSource.data.length).toEqual(0);
  });

  describe('2. faked data with async loading', () => {
    beforeEach(() => {
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
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
      expect(component.dataSource.data.length).toEqual(fakeData.finTranTypeTopNodeAmount);
    }));

    it('should show data after OnInit (async)', async(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSource.data.length).toEqual(0);

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(component.dataSource.data.length).toBeGreaterThan(0);
        expect(component.dataSource.data.length).toEqual(fakeData.finTranTypeTopNodeAmount);
      });
    }));

    it('should show data after fetchAllCurrencies (spy done)', (done: DoneFn) => {
      fixture.detectChanges();

      // the spy's most recent call returns the observable with the test quote
      fetchAllTranTypesSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();

        expect(component.dataSource.data.length).toBeGreaterThan(0);
        expect(component.dataSource.data.length).toEqual(fakeData.finTranTypeTopNodeAmount);
        done();
      });
    });
  });

  describe('3. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    it('should display error when Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick();
      // fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('snack-bar-container').length).toBe(1);
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Service failed',
        'Expected snack bar to show the error message: Service failed');

      // Clear
      flush();
    }));
  });
});
