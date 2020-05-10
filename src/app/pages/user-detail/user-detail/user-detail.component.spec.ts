import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

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

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [
        UserDetailComponent,
      ],
      imports: [
        NzDescriptionsModule,
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
