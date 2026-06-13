import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer, Overlay } from '@angular/cdk/overlay';
import { of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { LanguageComponent } from './language.component';
import { LanguageOdataService } from '../../services';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('LanguageComponent', () => {
  let component: LanguageComponent;
  let fixture: ComponentFixture<LanguageComponent>;
  let fakeData: FakeDataHelper;
  let langService: any;
  let fetchAllLanguagesSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildAppLanguage();
    langService = createSpyObj('LanguageOdataService', ['fetchAllLanguages']);
    fetchAllLanguagesSpy = langService.fetchAllLanguages.and.returnValue(of([]));
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        NzSpinModule,
        NzTableModule,
        NzBreadCrumbModule,
        NzPageHeaderModule,
        NzSwitchModule,
        getTranslocoModule(),
      ],
      providers: [
        { provide: LanguageOdataService, useValue: langService },
        Overlay,
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    // TestBed.overrideModule(BrowserDynamicTestingModule, {
    //   set: {
    //     entryComponents: [MessageDialogComponent],
    //   },
    // }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchAllLanguagesSpy.and.returnValue(asyncData(fakeData.appLanguages));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSource.length).toEqual(0);
    });

    it('should show data after OnInit', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();

      expect(component.dataSource.length).toBeGreaterThan(0);
      expect(component.dataSource.length).toEqual(fakeData.appLanguages.length);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllLanguagesSpy.and.returnValue(asyncData(fakeData.appLanguages));
    });

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Service fails', async () => {
      // tell spy to return an async error observable
      fetchAllLanguagesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
});
