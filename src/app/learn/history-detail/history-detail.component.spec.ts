import { async, ComponentFixture, TestBed, fakeAsync, inject, tick, flush, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, UrlSegment, ActivatedRoute, } from '@angular/router';
import { of } from 'rxjs';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { HttpLoaderTestFactory, ActivatedRouteUrlStub, RouterLinkDirectiveStub, FakeDataHelper,
  asyncData, asyncError, } from '../../../testing';
import { HistoryDetailComponent } from './history-detail.component';
import { LearnStorageService, HomeDefDetailService, UIStatusService } from '../../services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { LearnHistory } from 'app/model';

describe('HistoryDetailComponent', () => {
  let component: HistoryDetailComponent;
  let fixture: ComponentFixture<HistoryDetailComponent>;
  let fakeData: FakeDataHelper;
  let routerSpy: any;
  let readHistorySpy: any;
  let fetchAllObjectsSpy: any;
  let activatedRouteStub: any;
  let createHistorySpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildLearnCategories();
    fakeData.buildLearnObjects();
  });

  beforeEach(async(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const homeService: Partial<HomeDefDetailService> = {
      ChosedHome: fakeData.chosedHome,
    };

    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);
    const lrnStorageService: any = jasmine.createSpyObj('LearnStorageService', [
      'readHistory',
      'fetchAllObjects',
      'createHistory',
    ]);
    readHistorySpy = lrnStorageService.readHistory.and.returnValue();
    fetchAllObjectsSpy = lrnStorageService.fetchAllObjects.and.returnValue(of([]));
    createHistorySpy = lrnStorageService.createHistory.and.returnValue(of({}));

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        RouterLinkDirectiveStub,
        HistoryDetailComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: Router, useValue: routerSpy },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: LearnStorageService, useValue: lrnStorageService },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryDetailComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('create mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let hist: LearnHistory;

    beforeEach(() => {
      fetchAllObjectsSpy.and.returnValue(asyncData(fakeData.learnObjects));
      hist = new LearnHistory();
      hist.HID = fakeData.chosedHome.ID;
      hist.LearnDate = moment().add(-1, 'M');
      hist.ObjectId = fakeData.learnObjects[0].Id;
      hist.UserId = fakeData.currentUser.getUserId();

      createHistorySpy.and.returnValue(asyncData(hist));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('user is mandatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentMode).toEqual('Common.Create');
      expect(component.isFieldChangable).toBeTruthy();

      // Date - default
      expect(component.detailFormGroup.get('dateControl')).not.toBeNull();
      // User
      // component.detailFormGroup.get('userControl').setValue(fakeData.currentUser.getUserId());
      // Object it
      component.detailFormGroup.get('objControl').setValue(fakeData.learnObjects[0].Id);

      expect(component.detailFormGroup.valid).toBeFalsy();
    }));

    it('object is mandatory', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentMode).toEqual('Common.Create');
      expect(component.isFieldChangable).toBeTruthy();

      // Date - default
      expect(component.detailFormGroup.get('dateControl')).not.toBeNull();
      // User
      component.detailFormGroup.get('userControl').setValue(fakeData.currentUser.getUserId());
      // Object it
      // component.detailFormGroup.get('objControl').setValue(fakeData.learnObjects[0].Id);

      expect(component.detailFormGroup.valid).toBeFalsy();
    }));

    it('shall popup a dialog if objects failed to fetch', fakeAsync(() => {
      fetchAllObjectsSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect a dialog;
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));

    it('shall save object in success case', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentMode).toEqual('Common.Create');
      expect(component.isFieldChangable).toBeTruthy();

      // Date - default
      expect(component.detailFormGroup.get('dateControl')).not.toBeNull();
      // User
      component.detailFormGroup.get('userControl').setValue(fakeData.currentUser.getUserId());
      // Object it
      component.detailFormGroup.get('objControl').setValue(fakeData.learnObjects[0].Id);

      expect(component.detailFormGroup.valid).toBeTruthy();

      component.onSubmit();
      expect(createHistorySpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull();

      tick(2000);
      fixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalled();

      flush();
    }));

    it('shall popup a dialog for failed case', fakeAsync(() => {
      createHistorySpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentMode).toEqual('Common.Create');
      expect(component.isFieldChangable).toBeTruthy();

      // Date - default
      expect(component.detailFormGroup.get('dateControl')).not.toBeNull();
      // User
      component.detailFormGroup.get('userControl').setValue(fakeData.currentUser.getUserId());
      // Object it
      component.detailFormGroup.get('objControl').setValue(fakeData.learnObjects[0].Id);

      expect(component.detailFormGroup.valid).toBeTruthy();

      component.onSubmit();
      expect(createHistorySpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect a dialog;
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));
  });

  describe('3. display mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let hist: LearnHistory;

    beforeEach(() => {
      fetchAllObjectsSpy.and.returnValue(asyncData(fakeData.learnObjects));
      hist = new LearnHistory();
      hist.HID = fakeData.chosedHome.ID;
      hist.LearnDate = moment().add(-1, 'M');
      hist.ObjectId = fakeData.learnObjects[0].Id;
      hist.UserId = fakeData.currentUser.getUserId();

      readHistorySpy.and.returnValue(asyncData(hist));
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall display the history', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(readHistorySpy).toHaveBeenCalled();
      expect(component.detailFormGroup.get('userControl').value).toEqual(fakeData.currentUser.getUserId());
    }));

    it('shall popup a dialog if failed to history', fakeAsync(() => {
      readHistorySpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect a dialog;
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
