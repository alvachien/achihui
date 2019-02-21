import { async, ComponentFixture, TestBed, fakeAsync, inject, flush, tick, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError, } from '../../testing';
import { HomeDefListComponent } from './home-def-list.component';
import { HomeDefDetailService, UIStatusService, } from '../services';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

describe('HomeDefListComponent', () => {
  let component: HomeDefListComponent;
  let fixture: ComponentFixture<HomeDefListComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let fetchAllHomeDefSpy: any;
  let routerSpy: any;
  let homeService: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildHomeDefs();

    homeService = jasmine.createSpyObj('HomeDefDetailService', ['fetchAllHomeDef']);
    fetchAllHomeDefSpy = homeService.fetchAllHomeDef.and.returnValue(of([]));
    homeService.ChosedHome = fakeData.chosedHome;
    // homeService.RedirectURL = 'aaa';
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

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
        HomeDefListComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: Router, useValue: routerSpy },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeDefListComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  it('1. should be created without data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchAllHomeDefSpy.and.returnValue(asyncData(fakeData.HomeDefs));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSource.data.length).toEqual(0);
    });

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();

      expect(component.dataSource.data.length).toBeGreaterThan(0);
      expect(component.dataSource.data.length).toEqual(fakeData.HomeDefs.length);
    }));

    it('should navigate to create page if create home button clicks', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();

      component.onCreateHome();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/homedef/create']);
    }));

    it('should select the home if no home chosed yet', fakeAsync(() => {
      homeService.ChosedHome = undefined;

      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();

      expect(component.IsCurrentHomeChosed).toBeFalsy();

      // Simulate the row click
      component.onChooseHome(component.dataSource.data[0]);
      expect(component.IsCurrentHomeChosed).toBeTruthy();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    }));
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllHomeDefSpy.and.returnValue(asyncData(fakeData.HomeDefs));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllHomeDefSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));
  });
});
