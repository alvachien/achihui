import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject } from 'rxjs';

import { UserAuthInfo } from 'src/app/model';
import { AuthService, HomeDefOdataService, UIStatusService } from 'src/app/services';
import { FakeDataHelper, getTranslocoModule } from 'src/testing';
import { LibraryUIModule } from '../../library-ui.module';

import { BookCategorySelectionDlgComponent } from './book-category-selection-dlg.component';

describe('BookCategorySelectionDlgComponent', () => {
  let component: BookCategorySelectionDlgComponent;
  let fixture: ComponentFixture<BookCategorySelectionDlgComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let readBookSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
  });

  beforeEach(async () => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const homeService: Partial<HomeDefOdataService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        LibraryUIModule,
        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule(),
      ],
      declarations: [ BookCategorySelectionDlgComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        {
          provide: NzModalRef,
          useFactory: (modalSvc: NzModalService) => modalSvc.create({
            nzClosable: true,
            nzContent: 'test'
          }),
          deps: [NzModalService]
        },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookCategorySelectionDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
