import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flush } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController, } from '@angular/common/http/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { BehaviorSubject, of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { HomeDefListComponent } from './home-def-list.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, } from '../../../services';
import { UserAuthInfo } from '../../../model';

describe('HomeDefListComponent', () => {
  let component: HomeDefListComponent;
  let fixture: ComponentFixture<HomeDefListComponent>;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let fetchAllHomeDefSpy: any;
  let routerSpy: any;
  let homeService: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildHomeDefs();
  });

  beforeEach(async(() => {
    homeService = jasmine.createSpyObj('HomeDefOdataService', ['fetchAllHomeDef']);
    fetchAllHomeDefSpy = homeService.fetchAllHomeDef.and.returnValue(of([]));
    homeService.ChosedHome = fakeData.chosedHome;
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [
        HomeDefListComponent,
      ],
      providers: [
        UIStatusService,
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: Router, useValue: routerSpy },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeDefListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
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
      expect(component.dataSource.length).toEqual(0);
    });

    xit('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.dataSource.length).toBeGreaterThan(0);
      expect(component.dataSource.length).toEqual(fakeData.HomeDefs.length);

      flush();
      tick();
    }));

    xit('should navigate to create page if create home button clicks', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateHome();
      tick();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/homedef/create']);

      flush();
      tick();
    }));

    xit('should choose the home successfully', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();

      // Simulate the row click
      component.onChooseHome(component.dataSource[0]);
      tick(); // Complete the observables.
      expect(component.IsCurrentHomeChosed).toBeTruthy();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    }));
  });

  // xdescribe('3. shall display error dialog for exception', () => {
  //   let overlayContainer: OverlayContainer;
  //   let overlayContainerElement: HTMLElement;

  //   beforeEach(() => {
  //     fetchAllHomeDefSpy.and.returnValue(asyncData(fakeData.HomeDefs));
  //   });

  //   beforeEach(inject([OverlayContainer],
  //     (oc: OverlayContainer) => {
  //     overlayContainer = oc;
  //     overlayContainerElement = oc.getContainerElement();
  //   }));

  //   afterEach(() => {
  //     overlayContainer.ngOnDestroy();
  //   });

  //   xit('should display error when Service fails', fakeAsync(() => {
  //     // tell spy to return an async error observable
  //     fetchAllHomeDefSpy.and.returnValue(asyncError<string>('Service failed'));

  //     fixture.detectChanges();
  //     tick(); // complete the Observable in ngOnInit
  //     fixture.detectChanges();

  //     // Expect there is a dialog
  //     expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
  //     // Since there is only one button
  //     (overlayContainerElement.querySelector('button') as HTMLElement).click();
  //     fixture.detectChanges();
  //     flush();

  //     expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

  //     flush();
  //   }));
  // });
});
