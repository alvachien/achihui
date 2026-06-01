import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, inject, flush} from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject, of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';

import {createSpyObj, getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ElementClass_DialogContent,
  ElementClass_DialogCloseButton,} from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, Plan } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { PlanListComponent } from './plan-list.component';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PlanListComponent', () => {
  let component: PlanListComponent;
  let fixture: ComponentFixture<PlanListComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllPlansSpy: SafeAny;
  let fetchAllAccountSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinPlans();
    fakeData.buildFinAccounts();

    storageService = createSpyObj('FinanceOdataService', ['fetchAllPlans', 'fetchAllAccounts', 'fetchAccountBalance']);
    fetchAllPlansSpy = storageService.fetchAllPlans.and.returnValue(of([]));
    fetchAllAccountSpy = storageService.fetchAllAccounts.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    // declarations moved to imports
    imports: [FormsModule,
        
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule()],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    // TestBed.overrideModule(BrowserDynamicTestingModule, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return false for isChildMode when member is not a child', () => {
    expect(component.isChildMode).toBe(false);
  });

  it('should return true for isChildMode when member is a child', () => {
    homeService.CurrentMemberInChosedHome!['IsChild'] = true;
    expect(component.isChildMode).toBe(true);
    homeService.CurrentMemberInChosedHome!['IsChild'] = false;
  });

  it('should return account name for valid id', () => {
    component.arAccounts = fakeData.finAccounts;
    const name = component.getAccountName(fakeData.finAccounts[0].Id as number);
    expect(name).toBe(fakeData.finAccounts[0].Name as string);
  });

  it('should return empty string for invalid id', () => {
    component.arAccounts = fakeData.finAccounts;
    expect(component.getAccountName(9999)).toBe('');
  });

  it('should set progress modal visible on check progress', () => {
    storageService.fetchAccountBalance.and.returnValue(of(500));
    const plan = new Plan();
    plan.AccountID = 1;
    component.onCheckProgress(plan);
    expect(component.isProgressDlgVisible).toBe(true);
    expect(component.currentPlan).toBe(plan);
  });

  it('should not set progress modal when plan is null', () => {
    component.onCheckProgress(null as any);
    expect(component.isProgressDlgVisible).toBe(false);
  });

  it('should return 0 for currentDifferenceWithTarget when no plan', () => {
    component.currentPlan = undefined;
    expect(component.currentDifferenceWithTarget).toBe(0);
  });

  it('should return difference for currentDifferenceWithTarget', () => {
    const plan = new Plan();
    plan.TargetBalance = 1000;
    component.currentPlan = plan;
    component.currentPlanActualBalance = 800;
    expect(component.currentDifferenceWithTarget).toBe(-200);
  });

  it('should hide progress modal on handleProgressModalCancel', () => {
    component.isProgressDlgVisible = true;
    component.handleProgressModalCancel();
    expect(component.isProgressDlgVisible).toBe(false);
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchAllPlansSpy.and.returnValue(asyncData(fakeData.finPlans));
      fetchAllAccountSpy.and.returnValue(asyncData(fakeData.finAccounts));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSet.length).toEqual(0);
    });

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();

      expect(component.dataSet.length).toBeGreaterThan(0);
      expect(component.dataSet.length).toEqual(fakeData.finPlans.length);

      flush();
    }));
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllPlansSpy.and.returnValue(asyncData(fakeData.finPlans));
      fetchAllAccountSpy.and.returnValue(asyncData(fakeData.finAccounts));
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when fetchAllPlans fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllPlansSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should display error when fetchAllAccounts fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));
  });
});
