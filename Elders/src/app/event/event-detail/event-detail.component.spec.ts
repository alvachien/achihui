import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { of } from 'rxjs';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderTestFactory, ActivatedRouteUrlStub } from '../../../testing';
import { EventStorageService, HomeDefDetailService, UIStatusService, } from 'app/services';
import { EventDetailComponent } from './event-detail.component';

describe('EventDetailComponent', () => {
  let component: EventDetailComponent;
  let fixture: ComponentFixture<EventDetailComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(async(() => {
    const stgserviceStub: Partial<EventStorageService> = {};
    const homeService: any = jasmine.createSpyObj('HomeDefDetailService', ['fetchAllMembersInChosedHome']);
    homeService.ChosedHome = {
      _id: 1,
    };
    const chosedHomeMemSpy: any = homeService.fetchAllMembersInChosedHome.and.returnValue();
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteStub: any = new ActivatedRouteUrlStub([new UrlSegment('create', {})]);

    /*     const tree: UrlTree = router.parseUrl('/team;id=33');
      *     const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
      *     const s: UrlSegment[] = g.segments;
      *     s[0].path; // returns 'team'
      *     s[0].parameters; // returns {id: 33}
      * */

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        NoopAnimationsModule,
        FormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [ EventDetailComponent ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: EventStorageService, useValue: stgserviceStub },
        { provide: Router, useValue: routerSpy },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDetailComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
