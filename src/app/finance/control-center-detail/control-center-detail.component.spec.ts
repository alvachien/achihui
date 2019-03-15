import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flush, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
  MatStepperNext, MatCheckbox, } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { ControlCenterDetailComponent } from './control-center-detail.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';

describe('ControlCenterDetailComponent', () => {
  let component: ControlCenterDetailComponent;
  let fixture: ComponentFixture<ControlCenterDetailComponent>;
  let fakeData: FakeDataHelper;
  let routerSpy: any;
  let createControlCenterSpy: any;
  let readControlCenterSpy: any;
  let activatedRouteStub: any;
  let fetchAllControlCentersSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinControlCenter();
  });

  beforeEach(async(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'createControlCenter',
      'readControlCenter',
      'fetchAllControlCenters',
    ]);
    createControlCenterSpy = storageService.createControlCenter.and.returnValue(of([]));
    readControlCenterSpy = storageService.readControlCenter.and.returnValue(of({}));
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;

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
        ControlCenterDetailComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinanceStorageService, useValue: storageService },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterDetailComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('1. Create mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      createControlCenterSpy.and.returnValue(asyncData(fakeData.finControlCenters[0]));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall load the default values', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.existedCC.length).toEqual(fakeData.finControlCenters.length);
    }));

    it('shall popup an error dialog if control center failed to fetch', fakeAsync(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncError('server 500 failed!'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(fetchAllControlCentersSpy).toHaveBeenCalled();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));

    it('Name is mandatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.detailFormGroup.valid).toBeFalsy();
      component.detailFormGroup.get('nameControl').setValue('Test');
      component.detailFormGroup.get('nameControl').markAsDirty();
      component.detailFormGroup.get('nameControl').updateValueAndValidity();
      expect(component.detailFormGroup.valid).toBeTruthy();
    }));

    it('shall handle create success case', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.detailFormGroup.valid).toBeFalsy();
      component.detailFormGroup.get('nameControl').setValue('Test');
      component.detailFormGroup.get('nameControl').markAsDirty();
      component.detailFormGroup.get('nameControl').updateValueAndValidity();
      expect(component.detailFormGroup.valid).toBeTruthy();

      component.onSubmit();
      tick();
      fixture.detectChanges();
      expect(createControlCenterSpy).toHaveBeenCalled();

      flush();
    }));
  });

  describe('2. Change mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      readControlCenterSpy.and.returnValue(asyncData(fakeData.finControlCenters[0]));

      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall load the default values', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.existedCC.length).toEqual(fakeData.finControlCenters.length);
      expect(readControlCenterSpy).toHaveBeenCalled();
    }));

    it('shall popup an error dialog if control center failed to fetch', fakeAsync(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncError('server 500 failed!'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.existedCC.length).toEqual(fakeData.finControlCenters.length);

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));
  });
});
