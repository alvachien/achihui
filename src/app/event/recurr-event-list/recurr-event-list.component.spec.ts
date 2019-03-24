import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flush, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError, } from '../../../testing';
import { RecurrEventListComponent } from './recurr-event-list.component';
import { EventStorageService, HomeDefDetailService } from 'app/services';

describe('RecurrEventListComponent', () => {
  let component: RecurrEventListComponent;
  let fixture: ComponentFixture<RecurrEventListComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let fetchAllRecurEventsSpy: any;
  let routerSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
  });

  beforeEach(async(() => {
    const storageService: any = jasmine.createSpyObj('EventStorageService', ['fetchAllRecurEvents']);
    fetchAllRecurEventsSpy = storageService.fetchAllRecurEvents.and.returnValue(of([]));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const homeService: Partial<HomeDefDetailService> = {
      ChosedHome: fakeData.chosedHome,
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
      declarations: [ RecurrEventListComponent ],
      providers: [
        TranslateService,
        { provide: EventStorageService, useValue: storageService },
        { provide: Router, useValue: routerSpy },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurrEventListComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
    // fixture.detectChanges();
  });

  it('1. should create', () => {
    expect(component).toBeTruthy();
    fixture.detectChanges();
    expect(component.isLoadingResults).toBeFalsy();
  });
});
