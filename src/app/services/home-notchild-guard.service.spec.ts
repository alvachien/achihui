import { TestBed, inject } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { HomeNotChildGuardService } from './home-notchild-guard.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { UIStatusService } from './uistatus.service';
import { UserAuthInfo } from '../model';
import { FakeDataHelper } from '../../testing';

describe('HomeNotChildGuardService', () => {
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
    authServiceStub.doLogin = () => {};
    homeService.ChosedHome = fakeData.chosedHome;

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        HomeNotChildGuardService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: UIStatusService, useValue: uiServiceStub },
      ],
    });
  });

  it('should be created', inject([HomeNotChildGuardService], (service: HomeNotChildGuardService) => {
    expect(service).toBeTruthy();
  }));

  it('checkLogin without login', inject([HomeNotChildGuardService], (service: HomeNotChildGuardService) => {
    expect(service).toBeTruthy();

    const urInfo = new UserAuthInfo();
    urInfo.isAuthorized = true;
    authServiceStub.authSubject = new BehaviorSubject(urInfo);

    const isLogin = service.checkLogin();
    expect(isLogin).toBeTruthy();
  }));

  it('checkLogin with login', inject([HomeNotChildGuardService], (service: HomeNotChildGuardService) => {
    expect(service).toBeTruthy();

    const isLogin = service.checkLogin();
    expect(isLogin).toBeFalsy();
  }));
});
