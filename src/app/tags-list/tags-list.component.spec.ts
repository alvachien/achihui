import { async, ComponentFixture, TestBed, fakeAsync, flush, tick, inject } from '@angular/core/testing';
import { UIDependModule } from '../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { EventEmitter } from '@angular/core';
import { ThemeStorage } from '../theme-picker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatTabGroup } from '@angular/material';
import { By } from '@angular/platform-browser';

import { HttpLoaderTestFactory, RouterLinkDirectiveStub, FakeDataHelper, asyncData, asyncError } from '../../testing';
import { TagsListComponent } from './tags-list.component';
import { AuthService, HomeDefDetailService, TagsService, UIStatusService } from '../services';
import { UserAuthInfo, TagTypeEnum, } from '../model';

describe('TagsListComponent', () => {
  let component: TagsListComponent;
  let fixture: ComponentFixture<TagsListComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let fetchAllTagsSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildTags();
    fakeData.buildTagsCount();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);

    const tagService: any = jasmine.createSpyObj('TagsService', ['fetchAllTags']);
    fetchAllTagsSpy = tagService.fetchAllTags.and.returnValue(of([]));
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const themeStorageStub: Partial<ThemeStorage> = {};
    themeStorageStub.getStoredTheme = () => { return undefined; };
    themeStorageStub.onThemeUpdate = new EventEmitter<any>();

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
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
        RouterLinkDirectiveStub,
        TagsListComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: TagsService, useValue: tagService },
        { provide: Router, useValue: routerSpy },
        { provide: ThemeStorage, useValue: themeStorageStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsListComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  it('1. should be created with empty data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('2. [Chart View] faked data with async loading', () => {
    beforeEach(() => {
      fetchAllTagsSpy
        .withArgs(true).and.returnValue(asyncData(fakeData.tagsCount));
    });

    it('should not show data before OnInit', () => {
      expect(component.tagChartOption).toBeFalsy();
    });

    it('should show data after OnInit (fakeAsync)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.tagChartOption).toBeFalsy();

      tick();
      fixture.detectChanges();

      expect(component.tagChartOption).toBeTruthy();
    }));

    it('should show data after OnInit (async)', async(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.tagChartOption).toBeFalsy();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(component.tagChartOption).toBeTruthy();
      });
    }));

    it('should show data after fetchAllTags (spy done)', (done: DoneFn) => {
      fixture.detectChanges();

      // the spy's most recent call returns the observable with the test quote
      fetchAllTagsSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();

        expect(component.tagChartOption).toBeTruthy();
        done();
      });
    });
  });

  describe('3. [Chart View] Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllTagsSpy.and.returnValue(asyncData(fakeData.currencies));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    it('should display error when Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTagsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick();
      // fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('snack-bar-container').length).toBe(1);
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Service failed',
        'Expected snack bar to show the error message: Service failed');

      flush();
    }));
  });

  describe('4. [List View] faked data with async loading', () => {
    beforeEach(() => {
      fetchAllTagsSpy
        .withArgs(true).and.returnValue(asyncData(fakeData.tagsCount))
        .withArgs(false, TagTypeEnum.LearnQuestionBank, 'tag').and.returnValue(asyncData(fakeData.tags))
        ;
    });

    it('should not show data before OnInit', () => {
      expect(component.rstSearch.length).toEqual(0);
    });

    it('should show data after search', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.rstSearch.length).toEqual(0);

      // Now switch to new tab
      let tabComponent: MatTabGroup = fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;
      tabComponent.selectedIndex = 1;
      fixture.detectChanges();

      // Now input the term
      component.tagTerm = 'tag';
      component.tagType = TagTypeEnum.LearnQuestionBank;
      fixture.detectChanges();

      component.onSearchTagTerm();

      tick();
      fixture.detectChanges();

      expect(component.rstSearch.length).toBeGreaterThan(0);
    }));
  });
});
