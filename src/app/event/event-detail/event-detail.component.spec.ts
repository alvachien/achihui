import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { FormsModule } from '@angular/forms';
import { EventStorageService, HomeDefDetailService } from 'app/services';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { HttpLoaderTestFactory, ActivatedRouteStub } from '../../../testing';
import { EventDetailComponent } from './event-detail.component';

describe('EventDetailComponent', () => {
  let component: EventDetailComponent;
  let fixture: ComponentFixture<EventDetailComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(async(() => {
    const stgserviceStub: Partial<EventStorageService> = {};
    const homeService = jasmine.createSpyObj('HomeDefService', ['ChosedHome', 'fetchAllMembersInChosedHome']);
    const chosedHomeSpy = homeService.ChosedHome.and.returnValue( {
      _id: 1
    });
    const chosedHomeMemSpy = homeService.fetchAllMembersInChosedHome.and.returnValue();
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteStub = new ActivatedRouteStub();

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient]
          }
        })
      ],
      declarations: [ EventDetailComponent ],
      providers: [
        TranslateService,
        { provide: EventStorageService, useValue: stgserviceStub },
        { provide: Router, useValue: routerSpy },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
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

  it('1. should be created', () => {
    expect(component).toBeTruthy();
  });
});
