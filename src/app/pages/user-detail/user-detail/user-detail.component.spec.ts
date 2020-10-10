import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { UserDetailComponent } from './user-detail.component';
import { AuthService } from '../../../services';
import { FakeDataHelper, getTranslocoModule } from '../../../../testing';
import { BehaviorSubject } from 'rxjs';
import { UserAuthInfo } from '../../../model';

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
      declarations: [
        UserDetailComponent,
      ],
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        NzDescriptionsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
      ],
    })
    .compileComponents();
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
