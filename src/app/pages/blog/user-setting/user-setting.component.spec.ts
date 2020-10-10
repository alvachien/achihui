import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NzModalService } from 'ng-zorro-antd/modal';

import { BlogUIModule } from '../blog-ui.module';
import { getTranslocoModule, FakeDataHelper } from '../../../../testing';
import { UserSettingComponent } from './user-setting.component';
import { AuthService, UIStatusService, BlogOdataService, } from '../../../services';
import { UserAuthInfo } from '../../../model';

describe('UserSettingComponent', () => {
  let component: UserSettingComponent;
  let fixture: ComponentFixture<UserSettingComponent>;
  const authServiceStub: Partial<AuthService> = {};
  let fakeData: FakeDataHelper;
  let storageService: any;
  let readUserSettingSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = jasmine.createSpyObj('BlogOdataService', [
      'readUserSetting',
    ]);
    readUserSettingSpy = storageService.readUserSetting.and.returnValue(of({}));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        getTranslocoModule(),
        FormsModule,
        BlogUIModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
      ],
      declarations: [
        UserSettingComponent,
      ],
      providers: [
        { provide: BlogOdataService, useValue: storageService },
        NzModalService,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
