import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flush, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { OverviewComponent } from './overview.component';
import { EventStorageService, HomeDefDetailService, UIStatusService } from 'app/services';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fetchAllGeneralEventsSpy: any;
  let fetchHabitDetailWithCheckInSpy: any;
  let fakeData: FakeDataHelper;
  let routerSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
  });

  beforeEach(async(() => {
    const storageService: any = jasmine.createSpyObj('EventStorageService', [
      'fetchAllGeneralEvents',
      'fetchHabitDetailWithCheckIn',
    ]);
    fetchAllGeneralEventsSpy = storageService.fetchAllGeneralEvents.and.returnValue(of([]));
    fetchHabitDetailWithCheckInSpy = storageService.fetchHabitDetailWithCheckIn.and.returnValue(of([]));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const homeService: Partial<HomeDefDetailService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [ OverviewComponent ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: EventStorageService, useValue: storageService },
        { provide: Router, useValue: routerSpy },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
    fixture.detectChanges();
  });

  it('1. should create', () => {
    expect(component).toBeTruthy();
  });
});
