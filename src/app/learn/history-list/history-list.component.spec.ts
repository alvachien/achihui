import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import * as moment from 'moment';

import { HttpLoaderTestFactory, RouterLinkDirectiveStub, FakeDataHelper, asyncData, asyncError, } from '../../../testing';
import { HistoryListComponent } from './history-list.component';
import { LearnStorageService, UIStatusService } from '../../services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { LearnHistory } from 'app/model';

describe('HistoryListComponent', () => {
  let component: HistoryListComponent;
  let fixture: ComponentFixture<HistoryListComponent>;
  let fakeData: FakeDataHelper;
  let routerSpy: any;
  let fetchAllCategoriesSpy: any;
  let fetchAllObjectsSpy: any;
  let fetchAllHistoriesSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildLearnCategories();
    fakeData.buildLearnObjects();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const lrnStorageService: any = jasmine.createSpyObj('LearnStorageService', [
      'fetchAllCategories',
      'fetchAllObjects',
      'fetchAllHistories',
    ]);
    fetchAllCategoriesSpy = lrnStorageService.fetchAllCategories.and.returnValue(of([]));
    fetchAllObjectsSpy = lrnStorageService.fetchAllObjects.and.returnValue(of([]));
    fetchAllHistoriesSpy = lrnStorageService.fetchAllHistories.and.returnValue(of([]));

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
        HistoryListComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: Router, useValue: routerSpy },
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
    fixture = TestBed.createComponent(HistoryListComponent);
    component = fixture.componentInstance;
  });

  it('should be created without data', () => {
    expect(component).toBeTruthy();
  });

  describe('should work with data', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCategoriesSpy.and.returnValue(asyncData(fakeData.learnCategories));
      fetchAllObjectsSpy.and.returnValue(asyncData(fakeData.learnObjects));

      let arHist: LearnHistory[] = [];
      for (let i: number = 0; i < 3; i ++) {
        let hist: LearnHistory = new LearnHistory();
        hist.HID = fakeData.chosedHome.ID;
        hist.LearnDate = moment().add(-1 * i, 'M');
        hist.ObjectId = fakeData.learnObjects[i].Id;
        hist.UserId = fakeData.currentUser.getUserId();
        arHist.push(hist);
      }
      fetchAllHistoriesSpy.and.returnValue(asyncData(arHist));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall load the data', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.dataSource.data.length).toEqual(3);
    }));

    it('should popup dialog if failted to load category', fakeAsync(() => {
      fetchAllCategoriesSpy.and.returnValue(asyncError('error'));

      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      flush();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
    }));

    it('should popup dialog if failted to load objects', fakeAsync(() => {
      fetchAllObjectsSpy.and.returnValue(asyncError('error'));

      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      flush();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
    }));

    it('should popup dialog if failted to load histories', fakeAsync(() => {
      fetchAllHistoriesSpy.and.returnValue(asyncError('error'));

      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('.message-dialog-button-ok') as HTMLElement).click();
      flush();
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
    }));

    it('should navigate if creae/display/change button pressed', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      let hist: LearnHistory = component.dataSource.data[0];
      component.onDisplayHistory(hist);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/learn/history/display', hist.generateKey()]);
      component.onChangeHistory(hist);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/learn/history/edit', hist.generateKey()]);
    }));

    it('should refresh data if refresh button pressed', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick();
      fixture.detectChanges();

      expect(fetchAllHistoriesSpy).toHaveBeenCalledTimes(1);

      component.onRefresh();
      tick();
      expect(fetchAllHistoriesSpy).toHaveBeenCalledTimes(2);

      flush();
    }));
  });
});
