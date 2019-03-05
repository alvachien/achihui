import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, UrlSegment, ActivatedRoute, } from '@angular/router';
import { of } from 'rxjs';

import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper } from '../../../testing';
import { EnSentenceDetailComponent } from './en-sentence-detail.component';
import { LearnStorageService, HomeDefDetailService, UIStatusService } from '../../services';

describe('EnSentenceDetailComponent', () => {
  let component: EnSentenceDetailComponent;
  let fixture: ComponentFixture<EnSentenceDetailComponent>;
  let fakeData: FakeDataHelper;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();

    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    const activatedRouteStub: any = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);
    const lrnStroageService: any = jasmine.createSpyObj('LearnStorageService', [
      'readEnSentence',
    ]);
    const readEnSentenceSpy: any = lrnStroageService.readEnSentence.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        EnSentenceDetailComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: Router, useValue: routerSpy },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: LearnStorageService, useValue: lrnStroageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnSentenceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
