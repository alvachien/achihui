import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderTestFactory } from '../../../testing';
import { OverviewComponent } from './overview.component';
import { EventStorageService, HomeDefDetailService, UIStatusService } from 'app/services';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(async(() => {
    const storageService: any = jasmine.createSpyObj('EventStorageService', ['fetchAllEvents', 'fetchHabitDetailWithCheckIn']);
    const fetchAllEventsSpy: any = storageService.fetchAllEvents.and.returnValue(of([]));
    const fetchHabitDetailWithCheckInSpy: any = storageService.fetchHabitDetailWithCheckIn.and.returnValue(of([]));
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const homeService: any = jasmine.createSpyObj('HomeDefService', ['ChosedHome', 'fetchAllMembersInChosedHome']);
    const chosedHomeSpy: any = homeService.ChosedHome.and.returnValue( {
      _id: 1,
    });
    const uiStatusStub: Partial<UIStatusService> = {
      CurrentLanguage: 'en',
    };

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        BrowserAnimationsModule,
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
        { provide: EventStorageService, useValue: storageService },
        { provide: Router, useValue: routerSpy },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: UIStatusService, useValue: uiStatusStub },
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
