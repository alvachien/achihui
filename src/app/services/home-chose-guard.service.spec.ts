import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { HomeChoseGuardService } from './home-chose-guard.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { UIStatusService } from './uistatus.service';
import { UserAuthInfo } from '../model';
import { FakeDataHelper } from '../../testing';

describe('HomeChoseGuardService', () => {
  const authServiceStub: Partial<AuthService> = {};
  const homeService: Partial<HomeDefOdataService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let fakeData: FakeDataHelper;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    uiServiceStub.fatalError = false;
  });

  beforeEach(() => {
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    authServiceStub.doLogin = () => {
      // Do nothing
    };
    homeService.ChosedHome = fakeData.chosedHome;

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        HomeChoseGuardService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: UIStatusService, useValue: uiServiceStub },
      ],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(HomeChoseGuardService);
    expect(service).toBeTruthy();
  });

  it('checkLogin without login', () => {
    const service = TestBed.inject(HomeChoseGuardService);
    expect(service).toBeTruthy();

    const urInfo = new UserAuthInfo();
    urInfo.isAuthorized = true;
    authServiceStub.authSubject = new BehaviorSubject(urInfo);

    const isLogin = service.checkLogin();
    expect(isLogin).toBeTruthy();
  });

  it('checkLogin with login', () => {
    const service = TestBed.inject(HomeChoseGuardService);
    expect(service).toBeTruthy();

    const isLogin = service.checkLogin();
    expect(isLogin).toBeFalsy();
  });

  it('canActivate should return false when fatalError is true', () => {
    const service = TestBed.inject(HomeChoseGuardService);
    uiServiceStub.fatalError = true;
    const result = service.canActivate({} as any, { url: '/test' } as any);
    expect(result).toBe(false);
    uiServiceStub.fatalError = false;
  });

  it('canActivate should return false when ChosedHome is null', () => {
    const service = TestBed.inject(HomeChoseGuardService);
    const urInfo = new UserAuthInfo();
    urInfo.isAuthorized = true;
    authServiceStub.authSubject = new BehaviorSubject(urInfo);
    homeService.ChosedHome = null as any;

    const result = service.canActivate({} as any, { url: '/test' } as any);
    expect(result).toBe(false);
  });

  it('canActivate should return true when authorized and home chosen', () => {
    const service = TestBed.inject(HomeChoseGuardService);
    const urInfo = new UserAuthInfo();
    urInfo.isAuthorized = true;
    authServiceStub.authSubject = new BehaviorSubject(urInfo);
    homeService.ChosedHome = fakeData.chosedHome;

    const result = service.canActivate({} as any, { url: '/test' } as any);
    expect(result).toBe(true);
  });
});
