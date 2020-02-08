import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flush } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZorroAntdModule, NzModalService, NZ_I18N, en_US, } from 'ng-zorro-antd';
import { BehaviorSubject, of } from 'rxjs';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { HomeDefListComponent } from './home-def-list.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, } from '../../../services';
import { UserAuthInfo } from '../../../model';
import { MessageDialogComponent } from '../../message-dialog';

describe('HomeDefListComponent', () => {
  let component: HomeDefListComponent;
  let fixture: ComponentFixture<HomeDefListComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllHomeDefSpy: any;
  let homeService: any;
  let authServiceStub: Partial<AuthService>;
  let uiServiceStub: Partial<UIStatusService>;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildHomeDefs();

    authServiceStub = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    uiServiceStub = {};
    homeService = jasmine.createSpyObj('HomeDefOdataService', ['fetchAllHomeDef']);
    fetchAllHomeDefSpy = homeService.fetchAllHomeDef.and.returnValue(of([]));
    homeService.ChosedHome = fakeData.chosedHome;
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        NgZorroAntdModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        HomeDefListComponent,
        MessageDialogComponent,
      ],
      providers: [
        // { provide: UIStatusService, useValue: uiServiceStub },
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        // { provide: Router, useValue: routerSpy },
        { provide: NZ_I18N, useValue: en_US },
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
    // fixture.detectChanges();
  });

  it('1. should be created without data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    let routerstub: Router;

    beforeEach(() => {
      routerstub = TestBed.get(Router);
      spyOn(routerstub, 'navigate');

      fetchAllHomeDefSpy.and.returnValue(asyncData(fakeData.HomeDefs));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSource.length).toEqual(0);
    });

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.dataSource.length).toBeGreaterThan(0);
      expect(component.dataSource.length).toEqual(fakeData.HomeDefs.length);

      flush();
    }));

    it('should navigate to create page if create home button clicks', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();

      component.onCreateHome();
      tick();

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/homedef/create']);

      flush();
    }));

    it('should choose the home successfully', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();

      // Simulate the row click
      component.onChooseHome(component.dataSource[0]);
      tick(); // Complete the observables.
      expect(component.IsCurrentHomeChosed).toBeTruthy();

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/']);
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
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('button') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));
  });
});
