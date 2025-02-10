import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NzModalService } from 'ng-zorro-antd/modal';

import { BlogUIModule } from '../blog-ui.module';
import { getTranslocoModule, FakeDataHelper } from '../../../../testing';
import { UserSettingComponent } from './user-setting.component';
import { AuthService, BlogOdataService } from '../../../services';
import { UserAuthInfo } from '../../../model';
import { SafeAny } from 'src/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('UserSettingComponent', () => {
  let component: UserSettingComponent;
  let fixture: ComponentFixture<UserSettingComponent>;
  const authServiceStub: Partial<AuthService> = {};
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let readUserSettingSpy: SafeAny;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = jasmine.createSpyObj('BlogOdataService', ['readUserSetting']);
    readUserSettingSpy = storageService.readUserSetting.and.returnValue(of({}));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [UserSettingComponent],
    imports: [getTranslocoModule(),
        FormsModule,
        BlogUIModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule],
    providers: [{ provide: BlogOdataService, useValue: storageService }, NzModalService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(readUserSettingSpy).toHaveBeenCalled();
  });
});
