import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Router, UrlTree } from '@angular/router';
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
    // Use a simple in-memory store for RedirectURL during tests
    let _redirURL = '';
    Object.defineProperty(homeService, 'RedirectURL', {
      get() {
        return _redirURL;
      },
      set(url: string) {
        _redirURL = url;
      },
      configurable: true,
    });

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

  it('canActivate should return false when fatalError is true', () => {
    const service = TestBed.inject(HomeChoseGuardService);
    uiServiceStub.fatalError = true;
    const result = service.canActivate({} as any, { url: '/test' } as any);
    expect(result).toBe(false);
    uiServiceStub.fatalError = false;
  });

  it('canActivate should return a UrlTree to /homedef when ChosedHome is null', () => {
    const service = TestBed.inject(HomeChoseGuardService);
    const router = TestBed.inject(Router);
    const urInfo = new UserAuthInfo();
    urInfo.isAuthorized = true;
    authServiceStub.authSubject = new BehaviorSubject(urInfo);
    homeService.ChosedHome = null as any;

    const result = service.canActivate({} as any, { url: '/test' } as any);
    // Should return a UrlTree (not call router.navigate() which causes a race condition)
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe(router.parseUrl('/homedef').toString());
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

  it('canActivate should save attempted URL to RedirectURL before redirecting', () => {
    const service = TestBed.inject(HomeChoseGuardService);
    const urInfo = new UserAuthInfo();
    urInfo.isAuthorized = true;
    authServiceStub.authSubject = new BehaviorSubject(urInfo);
    homeService.ChosedHome = null as any;

    service.canActivate({} as any, { url: '/finance/overview' } as any);
    expect(homeService.RedirectURL).toBe('/finance/overview');
  });
});
