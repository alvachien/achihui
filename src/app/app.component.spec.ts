import {
  TestBed,
  waitForAsync,
  ComponentFixture,
  fakeAsync,
  tick,
  flush,
  discardPeriodicTasks,
} from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';

import { AppComponent } from './app.component';
import { getTranslocoModule } from '../testing';
import { AuthService, UIStatusService } from '../app/services';
import { UserAuthInfo } from './model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  const authServiceStub: Partial<AuthService> = {};
  const authinfo: UserAuthInfo = new UserAuthInfo();

  beforeAll(() => {
    const usrvalue = {
      userId: 'user1_sub',
      userName: 'user1',
      accessToken: 'user1_access_token',
    };
    authinfo.setContent(usrvalue);
    authServiceStub.authContent = new BehaviorSubject(authinfo);
    authServiceStub.doLogin = () => {
      // Do nothing
    };
    authServiceStub.doLogout = () => {
      // Do nothing
    };
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [AppComponent],
    imports: [RouterTestingModule,
        NzLayoutModule,
        NzMenuModule,
        NzIconModule,
        NzInputModule,
        NzDropDownModule,
        NzTableModule,
        NzModalModule,
        NoopAnimationsModule,
        getTranslocoModule()],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService },
        { provide: NZ_I18N, useValue: en_US },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
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

    discardPeriodicTasks();

    expect(component.isLoggedIn).toBeTruthy();

    flush();
  }));

  it('doLogon shall work', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    spyOn(authServiceStub, 'doLogin' as never);

    expect(authServiceStub.doLogin).toHaveBeenCalledTimes(0);
    component.onLogon();

    // if (environment.LoginRequired) {
    //   expect(authServiceStub.doLogin).toHaveBeenCalledTimes(1);
    // }

    discardPeriodicTasks();
    flush();
  }));

  it('doLogout shall work', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    spyOn(authServiceStub, 'doLogout' as never);

    expect(authServiceStub.doLogout).toHaveBeenCalledTimes(0);
    component.onLogout();
    // if (environment.LoginRequired) {
    //   expect(authServiceStub.doLogout).toHaveBeenCalledTimes(1);
    // }

    discardPeriodicTasks();
    flush();
  }));

  it('switch language shall work', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    component.switchLanguage('zh_CN');
    expect(component).toBeTruthy();
    component.switchLanguage('en_US');
    expect(component).toBeTruthy();

    discardPeriodicTasks();
    flush();
  }));
});
