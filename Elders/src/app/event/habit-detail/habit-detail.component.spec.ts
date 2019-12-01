import { async, ComponentFixture, TestBed, fakeAsync, inject, tick, flush, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { of } from 'rxjs';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';

import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { EventStorageService, HomeDefDetailService, UIStatusService, } from 'app/services';
import { HabitDetailComponent } from './habit-detail.component';
import { RepeatFrequencyEnum } from 'app/model';

describe('HabitDetailComponent', () => {
  let component: HabitDetailComponent;
  let fixture: ComponentFixture<HabitDetailComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let routerSpy: any;
  let activatedRouteStub: any;
  let readHabitEventSpy: any;
  let createHabitEventSpy: any;
  let generateHabitEventSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    const homeService: Partial<HomeDefDetailService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };
    const storageService: any = jasmine.createSpyObj('EventStorageService', [
      'readHabitEvent',
      'createHabitEvent',
      'generateHabitEvent',
    ]);
    readHabitEventSpy = storageService.readHabitEvent.and.returnValue(of({}));
    createHabitEventSpy = storageService.createHabitEvent.and.returnValue(of({}));
    generateHabitEventSpy = storageService.generateHabitEvent.and.returnValue(of([]));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})]);

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
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
      declarations: [ HabitDetailComponent ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: EventStorageService, useValue: storageService },
        { provide: Router, useValue: routerSpy },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitDetailComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  it('0. should create without data', () => {
    expect(component).toBeTruthy();
  });

  describe('1. Create mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      createHabitEventSpy.and.returnValue(of({}));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display default values', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.detailForm.valid).toBeFalsy();
      expect(component.isCreateMode).toBeTruthy();
      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.get('startDateControl').value).toBeTruthy();
      expect(component.detailForm.get('endDateControl').value).toBeTruthy();
      expect(component.detailForm.get('rptTypeControl').value).toEqual(RepeatFrequencyEnum.Month);
      expect(component.detailForm.get('countControl').value).toEqual(1);
    }));

    it('name is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.detailForm.valid).toBeFalsy();
      expect(component.isCreateMode).toBeTruthy();
      expect(component.isFieldChangable).toBeTruthy();

      // Name
      // component.detailForm.get('nameControl').setValue('test');
      // Start date - default
      // End date - default
      // Repeat tyep - default
      // Count - default
      // Content
      component.detailForm.get('contentControl').setValue('test');
      // Assignee
      component.detailForm.get('assigneeControl').setValue(fakeData.currentUser.getUserId());
      fixture.detectChanges();

      expect(component.detailForm.valid).toBeFalsy();
    }));

    it('content is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.detailForm.valid).toBeFalsy();
      expect(component.isCreateMode).toBeTruthy();
      expect(component.isFieldChangable).toBeTruthy();

      // Name
      component.detailForm.get('nameControl').setValue('test');
      // Start date - default
      // End date - default
      // Repeat tyep - default
      // Count - default
      // Content
      // component.detailForm.get('contentControl').setValue('test');
      // Assignee
      component.detailForm.get('assigneeControl').setValue(fakeData.currentUser.getUserId());
      fixture.detectChanges();

      expect(component.detailForm.valid).toBeFalsy();
    }));
    it('shall allow generate details in valid case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.detailForm.valid).toBeFalsy();
      expect(component.isCreateMode).toBeTruthy();
      expect(component.isFieldChangable).toBeTruthy();

      // Name
      component.detailForm.get('nameControl').setValue('test');
      // Start date - default
      // End date - default
      // Repeat tyep - default
      // Count - default
      // Content
      component.detailForm.get('contentControl').setValue('test');
      // Assignee
      component.detailForm.get('assigneeControl').setValue(fakeData.currentUser.getUserId());
      component.detailForm.updateValueAndValidity();
      fixture.detectChanges();

      expect(component.detailForm.valid).toBeTruthy('Detail form shall be valid');

      component.onGenerateDetails();
      expect(generateHabitEventSpy).toHaveBeenCalled();

      tick();
      fixture.detectChanges();

      flush();
    }));
  });
});
