import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError, } from '../../../testing';
import { EventStorageService, HomeDefDetailService } from 'app/services';
import { EventListComponent } from './event-list.component';

describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let fetchAllGeneralEventsSpy: any;
  let routerSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
  });

  beforeEach(async(() => {
    const storageService: any = jasmine.createSpyObj('EventStorageService', [
      'fetchAllGeneralEvents',
    ]);
    fetchAllGeneralEventsSpy = storageService.fetchAllGeneralEvents.and.returnValue(of({}));
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
      declarations: [ EventListComponent ],
      providers: [
        TranslateService,
        { provide: EventStorageService, useValue: storageService },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: Router, useValue: routerSpy },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
    // fixture.detectChanges();
  });

  it('should be created without data', () => {
    expect(component).toBeTruthy();
  });
});
