import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgZorroAntdModule, NZ_I18N, en_US, } from 'ng-zorro-antd';
import { BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { getTranslocoModule } from '../testing';
import { AuthService, HomeDefOdataService, } from '../app/services';
import { UserAuthInfo } from './model';
import { User } from 'oidc-client';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    let authinfo: UserAuthInfo = new UserAuthInfo();
    let usrvalue: Partial<User>;
    usrvalue = {
      profile: {
        name: 'user1',
        sub: 'user1_sub',
        mail: 'user1_mail',
        iss: '', 
        aud: '',
        exp: 1440,
        iat: 10,
      },
      access_token: 'user1_access_token',
      id_token: 'user1_id_token',
    };
    authinfo.setContent(usrvalue as User);
    authServiceStub.authContent = new BehaviorSubject(authinfo);
    // authServiceStub.doLogin = () => {};
    // authServiceStub.doLogout = () => {};

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        NgZorroAntdModule,
        NoopAnimationsModule,
        getTranslocoModule()
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: NZ_I18N, useValue: en_US },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
    // const app = fixture.debugElement.componentInstance;
    // expect(app).toBeTruthy();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('shall work with data', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.isLoggedIn).toBeTruthy();
  }));

  it('doLogon shall work', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    let authSvc = TestBed.get('AuthService') as AuthService;
    spyOn(authSvc, 'doLogin');

    expect(authSvc.doLogin).toHaveBeenCalledTimes(0);
    component.onLogon();
    expect(authSvc.doLogin).toHaveBeenCalledTimes(1);
  }));

  it('doLogout shall work', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    let authSvc = TestBed.get('AuthService') as AuthService;
    spyOn(authSvc, 'doLogout');

    expect(authSvc.doLogout).toHaveBeenCalledTimes(0);
    component.onLogout();
    expect(authSvc.doLogout).toHaveBeenCalledTimes(1);
  }));
});
