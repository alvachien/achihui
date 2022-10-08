import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, inject, flush, discardPeriodicTasks } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';

import { EventUIModule } from 'src/app/pages/event/event-ui.module';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError, } from '../../../../../testing';
import { AuthService, UIStatusService, LibraryStorageService, HomeDefOdataService, } from '../../../../services';
import { UserAuthInfo, financeAccountCategoryCash, Account, AccountStatusEnum, } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { RecurEventListComponent } from './recur-event-list.component';

describe('RecurEventListComponent', () => {
  let component: RecurEventListComponent;
  let fixture: ComponentFixture<RecurEventListComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchRecurEventsSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = jasmine.createSpyObj('LibraryStorageService', [
      'fetchRecurEvents',
    ]);
    fetchRecurEventsSpy = storageService.fetchRecurEvents.and.returnValue(of({}));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        EventUIModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [ RecurEventListComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: LibraryStorageService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurEventListComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchRecurEventsSpy.and.returnValue(asyncData({totalCount: 0, contentList: []}));
    });

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();

      expect(component.dataSet.length).toEqual(0);

      flush();
    }));
  });
});
