import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject } from 'rxjs';
import { Router, UrlSegment, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { getTranslocoModule, FakeDataHelper, ActivatedRouteUrlStub } from '../../../../../testing';
import { CollectionDetailComponent } from './collection-detail.component';
import { AuthService, UIStatusService, BlogOdataService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('CollectionDetailComponent', () => {
  let component: CollectionDetailComponent;
  let fixture: ComponentFixture<CollectionDetailComponent>;
  const authServiceStub: Partial<AuthService> = {};
  let fakeData: FakeDataHelper;
  let storageService: any;
  let readCollectionSpy: any;
  let createCollectionSpy: any;
  let activatedRouteStub: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = jasmine.createSpyObj('BlogOdataService', [
      'readCollection',
      'createCollection'
    ]);
    readCollectionSpy = storageService.readCollection.and.returnValue(of([]));
    createCollectionSpy = storageService.createCollection.and.returnValue(of({}));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgZorroAntdModule,
        getTranslocoModule(),
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        BrowserDynamicTestingModule,
      ],
      declarations: [
        CollectionDetailComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        UIStatusService,
        { provide: BlogOdataService, useValue: storageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});