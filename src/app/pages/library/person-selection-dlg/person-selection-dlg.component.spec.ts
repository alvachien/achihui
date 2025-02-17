import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject } from 'rxjs';

import { UserAuthInfo } from '@model/index';
import { AuthService, HomeDefOdataService, UIStatusService } from '@services/index';
import { SafeAny } from '@common/any';
import { FakeDataHelper, getTranslocoModule } from 'src/testing';
import { LibraryUIModule } from '../../library-ui.module';
import { PersonSelectionDlgComponent } from './person-selection-dlg.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PersonSelectionDlgComponent', () => {
  let component: PersonSelectionDlgComponent;
  let fixture: ComponentFixture<PersonSelectionDlgComponent>;
  let fakeData: FakeDataHelper;
  //let storageService: SafeAny;
  let readBookSpy: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  // const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
  });

  beforeEach(async () => {
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    await TestBed.configureTestingModule({
    declarations: [PersonSelectionDlgComponent],
    imports: [FormsModule,
        LibraryUIModule,
        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule()],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        {
            provide: NzModalRef,
            useFactory: (modalSvc: NzModalService) => modalSvc.create({
                nzClosable: true,
                nzContent: 'test',
            }),
            deps: [NzModalService],
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonSelectionDlgComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    const btest = false;
    if (btest) {
      expect(readBookSpy).not.toHaveBeenCalled();
    }
  });
});
