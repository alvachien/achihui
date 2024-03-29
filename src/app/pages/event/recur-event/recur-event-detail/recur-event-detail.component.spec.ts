import { ComponentFixture, TestBed, fakeAsync, tick, inject, flush, discardPeriodicTasks } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';

import { EventUIModule } from '../../event-ui.module';
import {
  getTranslocoModule,
  FakeDataHelper,
  asyncData,
  asyncError,
  ActivatedRouteUrlStub,
} from '../../../../../testing';
import { AuthService, UIStatusService, EventStorageService, HomeDefOdataService } from '../../../../services';
import { UserAuthInfo, RecurEvent } from '../../../../model';
import { RecurEventDetailComponent } from './recur-event-detail.component';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { SafeAny } from 'src/common';

describe('RecurEventDetailComponent', () => {
  let component: RecurEventDetailComponent;
  let fixture: ComponentFixture<RecurEventDetailComponent>;
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let readRecurEventSpy: SafeAny;
  let createGeneralEventSpy: SafeAny;
  let activatedRouteStub: SafeAny;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = jasmine.createSpyObj('EventStorageService', ['readRecurEvent', 'createGeneralEvent']);
    readRecurEventSpy = storageService.readRecurEvent.and.returnValue(of({}));
    createGeneralEventSpy = storageService.createGeneralEvent.and.returnValue(of({}));
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

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
      declarations: [RecurEventDetailComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: EventStorageService, useValue: storageService },
        { provide: HomeDefOdataService, useValue: homeService },
        NzModalService,
        { provide: NZ_I18N, useValue: en_US },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurEventDetailComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(createGeneralEventSpy).not.toHaveBeenCalled();
  });

  describe('01. Create mode', () => {
    let nobj: RecurEvent;
    beforeEach(() => {
      nobj = new RecurEvent();
      nobj.ID = 2;
      nobj.Name = 'test';

      readRecurEventSpy.and.returnValue(asyncData(nobj));
    });

    it('create mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBeTruthy();

      discardPeriodicTasks();
    }));
  });

  // describe('02. Change mode', () => {
  // });

  describe('03. Display mode', () => {
    let nobj: RecurEvent;
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);

      nobj = new RecurEvent();
      nobj.ID = 2;
      nobj.Name = 'test';

      readRecurEventSpy.and.returnValue(asyncData(nobj));
    });

    it('display mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isEditable).toBeFalse();
      const nname = component.detailFormGroup.get('nameControl')?.value;
      expect(nname).toEqual(nobj.Name);

      discardPeriodicTasks();
    }));
  });

  describe('99. error cases', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();

      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);
      readRecurEventSpy.and.returnValue(asyncError('Failed'));
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall display error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      discardPeriodicTasks();
    }));
  });
});
