import { async, ComponentFixture, TestBed, tick, flush, fakeAsync, inject } from '@angular/core/testing';
import { UIDependModule } from '../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../testing';
import { LanguageComponent } from './language.component';
import { LanguageService } from '../services';

describe('LanguageComponent', () => {
  let component: LanguageComponent;
  let fixture: ComponentFixture<LanguageComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let fetchAllLanguagesSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildAppLanguage();

    const langService: any = jasmine.createSpyObj('LanguageService', ['fetchAllLanguages']);
    fetchAllLanguagesSpy = langService.fetchAllLanguages.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        UIDependModule,
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
      declarations: [ LanguageComponent ],
      providers: [
        TranslateService,
        { provide: LanguageService, useValue: langService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  it('1. should be created with empty data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.dataSource!.data!.length).toEqual(0);
  });

  describe('faked data with async loading', () => {
    beforeEach(() => {
      fetchAllLanguagesSpy.and.returnValue(asyncData(fakeData.appLanguages));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSource.data.length).toEqual(0);
    });

    it('should show data after OnInit (fakeAsync)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSource.data.length).toEqual(0);

      tick();
      fixture.detectChanges();

      expect(component.dataSource.data!.length).toBeGreaterThan(0);
      expect(component.dataSource.data.length).toEqual(fakeData.appLanguages.length);
    }));

    it('should show data after OnInit (async)', async(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSource.data!.length).toEqual(0);

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(component.dataSource.data.length).toBeGreaterThan(0);
        expect(component.dataSource.data.length).toEqual(fakeData.appLanguages.length);
      });
    }));

    it('should show data after fetchAllLanguages (spy done)', (done: DoneFn) => {
      fixture.detectChanges();

      // the spy's most recent call returns the observable with the test quote
      fetchAllLanguagesSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();

        expect(component.dataSource.data.length).toBeGreaterThan(0);
        expect(component.dataSource.data.length).toEqual(fakeData.appLanguages.length);
        done();
      });
    });

  });

  describe('Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllLanguagesSpy.and.returnValue(asyncData(fakeData.appLanguages));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    it('should display error when Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllLanguagesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      expect(component.dataSource.data.length).toEqual(0);
      flush();

      tick();
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Service failed',
        'Expected snack bar to show the error message: Service failed');
    }));
  });
});
