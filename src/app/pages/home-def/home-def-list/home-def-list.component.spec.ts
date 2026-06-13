import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer, Overlay } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { HomeDefListComponent } from './home-def-list.component';
import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../testing';
import { AuthService, HomeDefOdataService } from '../../../services';
import { UserAuthInfo } from '../../../model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('HomeDefListComponent', () => {
  let component: HomeDefListComponent;
  let fixture: ComponentFixture<HomeDefListComponent>;
  let fakeData: FakeDataHelper;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchAllHomeDefSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let homeService: any;
  let authServiceStub: Partial<AuthService>;
  //let uiServiceStub: Partial<UIStatusService>;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildHomeDefs();

    authServiceStub = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    //uiServiceStub = {};
    homeService = createSpyObj('HomeDefOdataService', ['fetchAllHomeDef']);
    fetchAllHomeDefSpy = homeService.fetchAllHomeDef.and.returnValue(of([]));
    homeService.ChosedHome = fakeData.chosedHome;
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NzPageHeaderModule,
        NzTableModule,
        NzResultModule,
        NzSpinModule,
        NzInputModule,
        NzFormModule,
        NzSelectModule,
        NzBreadCrumbModule,
        NzDividerModule,
        NzCheckboxModule,
        NzButtonModule,
        getTranslocoModule(),
      ],
      providers: [
        // { provide: UIStatusService, useValue: uiServiceStub },
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: NZ_I18N, useValue: en_US },
        Overlay,
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    // TestBed.overrideModule(BrowserDynamicTestingModule, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  });

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
      routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      fetchAllHomeDefSpy.and.returnValue(asyncData(fakeData.HomeDefs));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSource.length).toEqual(0);
    });

    it('should show data after OnInit', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.dataSource.length).toBeGreaterThan(0);
      expect(component.dataSource.length).toEqual(fakeData.HomeDefs.length);

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    // TBD: navigation not done by method now
    // it('should navigate to create page if create home button clicks', async () => {
    //   fixture.detectChanges(); // ngOnInit()
    //   await new Promise<void>(r => setTimeout(r, 0)); // Complete the observables in ngOnInit
    //   fixture.detectChanges();

    //   component.onCreateHome();
    //   await new Promise<void>(r => setTimeout(r, 0));

    //   expect(routerstub.navigate).toHaveBeenCalled();
    //   expect(routerstub.navigate).toHaveBeenCalledWith(['/homedef/create']);

    //   await new Promise<void>(r => setTimeout(r, 0));
    // }));

    it('should choose the home successfully', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();

      // Simulate the row click
      component.onChooseHome(component.dataSource[0]);
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables.
      expect(component.IsCurrentHomeChosed).toBeTruthy();

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/']);
    });

    // TBD: navigation not done by method
    // it('shall navigate to home display successfully', async () => {
    //   fixture.detectChanges(); // ngOnInit()
    //   await new Promise<void>(r => setTimeout(r, 0)); // Complete the observables in ngOnInit
    //   fixture.detectChanges();

    //   component.onDisplayHome(component.dataSource[0]);
    //   await new Promise<void>(r => setTimeout(r, 0)); // Complete the observables.
    //   fixture.detectChanges();

    //   expect(routerstub.navigate).toHaveBeenCalled();
    //   expect(routerstub.navigate).toHaveBeenCalledWith(['/homedef/display/' + component.dataSource[0].ID.toString()]);
    // }));
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllHomeDefSpy.and.returnValue(asyncData(fakeData.HomeDefs));
    });

    beforeEach(() => {
      const oc = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Service fails', async () => {
      // tell spy to return an async error observable
      fetchAllHomeDefSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
});
