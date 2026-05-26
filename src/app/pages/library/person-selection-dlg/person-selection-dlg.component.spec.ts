import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject } from 'rxjs';

import { UserAuthInfo } from '@model/index';
import { AuthService, HomeDefOdataService, UIStatusService } from '@services/index';
import { SafeAny } from '@common/any';
import { FakeDataHelper, getTranslocoModule } from 'testing';
import { PersonSelectionDlgComponent } from './person-selection-dlg.component';
import { LibraryUIModule } from '../library-ui.module';
import { LibraryStorageService } from '@services/index';
import { Person } from '@model/index';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PersonSelectionDlgComponent', () => {
  let component: PersonSelectionDlgComponent;
  let fixture: ComponentFixture<PersonSelectionDlgComponent>;
  let fakeData: FakeDataHelper;
  //let storageService: SafeAny;
  let readBookSpy: SafeAny;
  let libraryService: SafeAny;
  const mockPersons: Person[] = [
    { ID: 1, Name: 'Person1' } as unknown as Person,
    { ID: 2, Name: 'Person2' } as unknown as Person,
  ];
  const authServiceStub: Partial<AuthService> = {};
  // const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    libraryService = jasmine.createSpyObj('LibraryStorageService', ['fetchAllPersons']);
  });

  beforeEach(async () => {
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    await TestBed.configureTestingModule({
    // declarations moved to imports
    imports: [FormsModule,
        LibraryUIModule,
        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule(),
        PersonSelectionDlgComponent],
    providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: LibraryStorageService, useValue: libraryService },
        NzMessageService,
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

  it('should add id to set when checked is true', () => {
    component.setOfCheckedId = new Set();
    component.updateCheckedSet(1, true);
    expect(component.setOfCheckedId.has(1)).toBeTrue();
  });

  it('should remove id from set when checked is false', () => {
    component.setOfCheckedId = new Set([1, 2]);
    component.updateCheckedSet(1, false);
    expect(component.setOfCheckedId.has(1)).toBeFalse();
  });

  it('should refresh checked status on current page data change', () => {
    component.setOfCheckedId = new Set();
    component.listOfCurrentPagePerson = mockPersons;
    component.onCurrentPageDataChange(mockPersons);
    expect(component.checked).toBeFalse();
  });

  it('should call updateCheckedSet on item checked', () => {
    spyOn(component, 'updateCheckedSet');
    component.onItemChecked(1, true);
    expect(component.updateCheckedSet).toHaveBeenCalledWith(1, true);
  });

  it('should check all items on all checked', () => {
    component.setOfCheckedId = new Set();
    component.listOfCurrentPagePerson = mockPersons;
    component.onAllChecked(true);
    expect(component.setOfCheckedId.size).toBe(2);
    expect(component.checked).toBeTrue();
  });

  it('should uncheck all items on all unchecked', () => {
    component.setOfCheckedId = new Set([1, 2]);
    component.listOfCurrentPagePerson = mockPersons;
    component.onAllChecked(false);
    expect(component.setOfCheckedId.size).toBe(0);
  });
});
