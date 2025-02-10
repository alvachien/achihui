import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';

import { UserDetailComponent } from './user-detail.component';
import { AuthService } from '../../../services';
import { FakeDataHelper, getTranslocoModule } from '../../../../testing';
import { BehaviorSubject } from 'rxjs';
import { UserAuthInfo } from '../../../model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let fakeData: FakeDataHelper;
  const authServiceStub: Partial<AuthService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [UserDetailComponent],
    imports: [NoopAnimationsModule,
        NzDescriptionsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NzPageHeaderModule,
        getTranslocoModule()],
    providers: [{ provide: AuthService, useValue: authServiceStub }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
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
});
