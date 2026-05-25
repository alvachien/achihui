import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';

import { UserDetailComponent } from './user-detail.component';
import { AuthService, HomeDefOdataService } from '../../services';
import { FakeDataHelper, getTranslocoModule } from '../../../testing';
import { BehaviorSubject } from 'rxjs';
import { UserAuthInfo } from '../../model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let fakeData: FakeDataHelper;
  const authServiceStub: Partial<AuthService> = {};
  const homeServiceStub: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    authServiceStub.authContent = authServiceStub.authSubject.asObservable();
    authServiceStub.doLogout = jasmine.createSpy('doLogout');
    homeServiceStub.ChosedHome = fakeData.chosedHome;
    homeServiceStub.CurrentMemberInChosedHome = fakeData.chosedHome.Members[0];
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    // declarations moved to imports
    imports: [NoopAnimationsModule,
        NzDescriptionsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NzPageHeaderModule,
        getTranslocoModule()],
    providers: [{ provide: AuthService, useValue: authServiceStub }, { provide: HomeDefOdataService, useValue: homeServiceStub }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate user info from auth service on init', fakeAsync(() => {
    // Set up authorized user before init
    const authorizedUser = new UserAuthInfo();
    authorizedUser.setContent({
      userId: 'test-user-id',
      userName: 'Test User',
      accessToken: 'test-token',
    });
    (authServiceStub.authSubject as BehaviorSubject<UserAuthInfo>).next(authorizedUser);
    fixture.detectChanges();
    tick();
    expect(component.userID).toBe('test-user-id');
    expect(component.userName).toBe('Test User');
  }));

  it('should populate home info when ChosedHome is set', () => {
    homeServiceStub.ChosedHome = fakeData.chosedHome;
    homeServiceStub.CurrentMemberInChosedHome = fakeData.chosedHome.Members[0];
    fixture.detectChanges();
    expect(component.currentHomeName).toBe(fakeData.chosedHome.Name);
  });

  it('should not populate home info when ChosedHome is null', () => {
    homeServiceStub.ChosedHome = null as any;
    homeServiceStub.CurrentMemberInChosedHome = undefined;
    fixture.detectChanges();
    expect(component.currentHomeName).toBeNull();
  });

  it('should call doLogout on onLogout', () => {
    fixture.detectChanges();
    component.onLogout();
    expect(authServiceStub.doLogout).toHaveBeenCalled();
  });
});
