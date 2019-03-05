import { async, ComponentFixture, TestBed, tick, fakeAsync, flush, inject } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, forkJoin } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { ConfigComponent } from './config.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';
import { MatTabGroup } from '@angular/material';

describe('ConfigComponent', () => {
  let component: ConfigComponent;
  let fixture: ComponentFixture<ConfigComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllAssetCategoriesSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildFinConfigData();
  });

  beforeEach(async(() => {
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService',
      ['fetchAllAccountCategories', 'fetchAllDocTypes', 'fetchAllAssetCategories']);
    fetchAllAccountCategoriesSpy = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllDocTypesSpy = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllAssetCategoriesSpy = stroageService.fetchAllAssetCategories.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
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
        ConfigComponent,
      ],
      providers: [
        TranslateService,
        { provide: FinanceStorageService, useValue: stroageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigComponent);
    component = fixture.componentInstance;
  });

  it('1. should create with empty data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.dataSourceAcntCtgy.data.length).toEqual(0);
    expect(component.dataSourceDocType.data.length).toEqual(0);
    expect(component.dataSourceAsstCtgy.data.length).toEqual(0);
  });

  describe('2. faked data with async loading', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllAssetCategoriesSpy.and.returnValue(asyncData(fakeData.finAssetCategories));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSourceAcntCtgy.data.length).toEqual(0);
      expect(component.dataSourceDocType.data.length).toEqual(0);
      expect(component.dataSourceAsstCtgy.data.length).toEqual(0);
    });

    it('should show data after OnInit (fakeAsync)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSourceAcntCtgy.data.length).toEqual(0);
      expect(component.dataSourceDocType.data.length).toEqual(0);
      expect(component.dataSourceAsstCtgy.data.length).toEqual(0);

      tick();
      fixture.detectChanges();

      expect(component.dataSourceAcntCtgy.data.length).toBeGreaterThan(0);
      expect(component.dataSourceAcntCtgy.data.length).toEqual(fakeData.finAccountCategories.length);
      expect(component.dataSourceDocType.data.length).toBeGreaterThan(0);
      expect(component.dataSourceDocType.data.length).toEqual(fakeData.finDocTypes.length);
      expect(component.dataSourceAsstCtgy.data.length).toBeGreaterThan(0);
      expect(component.dataSourceAsstCtgy.data.length).toEqual(fakeData.finAssetCategories.length);
    }));

    it('should show data after OnInit (async)', async(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSourceAcntCtgy.data.length).toEqual(0);
      expect(component.dataSourceDocType.data.length).toEqual(0);
      expect(component.dataSourceAsstCtgy.data.length).toEqual(0);

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(component.dataSourceAcntCtgy.data.length).toBeGreaterThan(0);
        expect(component.dataSourceAcntCtgy.data.length).toEqual(fakeData.finAccountCategories.length);
        expect(component.dataSourceDocType.data.length).toBeGreaterThan(0);
        expect(component.dataSourceDocType.data.length).toEqual(fakeData.finDocTypes.length);
        expect(component.dataSourceAsstCtgy.data.length).toBeGreaterThan(0);
        expect(component.dataSourceAsstCtgy.data.length).toEqual(fakeData.finAssetCategories.length);
        });
    }));

    it('should show data after fetchAllCurrencies (spy done)', (done: DoneFn) => {
      fixture.detectChanges();

      // the spy's most recent call returns the observable with the test quote
      forkJoin(
        fetchAllAccountCategoriesSpy.calls.mostRecent().returnValue,
        fetchAllDocTypesSpy.calls.mostRecent().returnValue,
        fetchAllAssetCategoriesSpy.calls.mostRecent().returnValue,
      )
      .subscribe(() => {
        fixture.detectChanges();

        expect(component.dataSourceAcntCtgy.data.length).toBeGreaterThan(0);
        expect(component.dataSourceAcntCtgy.data.length).toEqual(fakeData.finAccountCategories.length);
        expect(component.dataSourceDocType.data.length).toBeGreaterThan(0);
        expect(component.dataSourceDocType.data.length).toEqual(fakeData.finDocTypes.length);
        expect(component.dataSourceAsstCtgy.data.length).toBeGreaterThan(0);
        expect(component.dataSourceAsstCtgy.data.length).toEqual(fakeData.finAssetCategories.length);
        done();
      });
    });

    it('should show correct number in table and paginator after tab switched', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSourceAcntCtgy.data.length).toEqual(0);
      expect(component.dataSourceDocType.data.length).toEqual(0);
      expect(component.dataSourceAsstCtgy.data.length).toEqual(0);

      tick();
      fixture.detectChanges();

      let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;
      // By default is 0
      expect(tabComponent.selectedIndex).toEqual(0);
      expect(component.dataSourceAcntCtgy.data.length).toBeGreaterThan(0);
      expect(component.dataSourceAcntCtgy.data.length).toEqual(fakeData.finAccountCategories.length);

      tabComponent.selectedIndex = 1;
      fixture.detectChanges();
      expect(component.dataSourceDocType.data.length).toBeGreaterThan(0);
      expect(component.dataSourceDocType.data.length).toEqual(fakeData.finDocTypes.length);

      tabComponent.selectedIndex = 2;
      fixture.detectChanges();
      expect(component.dataSourceAsstCtgy.data.length).toBeGreaterThan(0);
      expect(component.dataSourceAsstCtgy.data.length).toEqual(fakeData.finAssetCategories.length);
    }));
  });

  describe('3. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllAssetCategoriesSpy.and.returnValue(asyncData(fakeData.finAssetCategories));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    it('should display error when fetchAllAccountCategoriesSpy fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      expect(component.dataSourceAcntCtgy.data.length).toEqual(0);
      expect(component.dataSourceDocType.data.length).toEqual(0);
      expect(component.dataSourceAsstCtgy.data.length).toEqual(0);
      flush();

      tick();
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Service failed',
        'Expected snack bar to show the error message: Service failed');
      // Clear
      flush();
    }));

    it('should display error when fetchAllDocTypesSpy fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      expect(component.dataSourceAcntCtgy.data.length).toEqual(0);
      expect(component.dataSourceDocType.data.length).toEqual(0);
      expect(component.dataSourceAsstCtgy.data.length).toEqual(0);
      flush();

      tick();
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Service failed',
        'Expected snack bar to show the error message: Service failed');
      // Clear
      flush();
    }));

    it('should display error when fetchAllAssetCategoriesSpy fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAssetCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      expect(component.dataSourceAcntCtgy.data.length).toEqual(0);
      expect(component.dataSourceDocType.data.length).toEqual(0);
      expect(component.dataSourceAsstCtgy.data.length).toEqual(0);
      flush();

      tick();
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Service failed',
        'Expected snack bar to show the error message: Service failed');
      // Clear
      flush();
    }));
  });
});
