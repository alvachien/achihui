import { signal } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserAuthInfo } from '@model/index';
import { AuthService, HomeDefOdataService, UIStatusService } from '@services/index';
import { FakeDataHelper, getTranslocoModule } from 'testing';

import { LocationSelectionDlgComponent } from './location-selection-dlg.component';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('LocationSelectionDlgComponent', () => {
  let component: LocationSelectionDlgComponent;
  let fixture: ComponentFixture<LocationSelectionDlgComponent>;
  let fakeData: FakeDataHelper;
  //let storageService: any;
  const authServiceStub: Partial<AuthService> = {};
  //const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
  });

  beforeEach(async () => {
    authServiceStub.authSubject = signal(new UserAuthInfo());
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    await TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [
        FormsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule(),
        LocationSelectionDlgComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        {
          provide: NzModalRef,
          useFactory: (modalSvc: NzModalService) =>
            modalSvc.create({
              nzClosable: true,
              nzContent: 'test',
            }),
          deps: [NzModalService],
        },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationSelectionDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
