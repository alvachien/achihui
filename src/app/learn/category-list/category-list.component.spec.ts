import { async, ComponentFixture, TestBed, tick, flush, fakeAsync, inject } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { CategoryListComponent } from './category-list.component';
import { LearnStorageService } from '../../services';

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCategoriesSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildLibBookCategories();

    const lrnStroageService: any = jasmine.createSpyObj('LearnStorageService', [
      'fetchAllCategories',
    ]);
    fetchAllCategoriesSpy = lrnStroageService.fetchAllCategories.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        CategoryListComponent,
      ],
      providers: [
        TranslateService,
        { provide: LearnStorageService, useValue: lrnStroageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
  });

  it('1. should be created without data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.dataSource.data.length).toEqual(0);
  });

  describe('2. faked data with async loading', () => {
    beforeEach(() => {
      fetchAllCategoriesSpy.and.returnValue(asyncData(fakeData.libBookCategories));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSource.data.length).toEqual(0);
    });

    it('should show data after OnInit (fakeAsync)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSource.data.length).toEqual(0);

      tick();
      fixture.detectChanges();

      expect(component.dataSource.data.length).toBeGreaterThan(0);
      expect(component.dataSource.data.length).toEqual(fakeData.libBookCategories.length);
    }));

    it('should show data after OnInit (async)', async(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSource.data.length).toEqual(0);

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(component.dataSource.data.length).toBeGreaterThan(0);
        expect(component.dataSource.data.length).toEqual(fakeData.libBookCategories.length);
      });
    }));

    it('should show data after fetchAllCategories (spy done)', (done: DoneFn) => {
      fixture.detectChanges();

      // the spy's most recent call returns the observable with the test quote
      fetchAllCategoriesSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();

        expect(component.dataSource.data.length).toBeGreaterThan(0);
        expect(component.dataSource.data.length).toEqual(fakeData.libBookCategories.length);
        done();
      });
    });

  });

  describe('3. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCategoriesSpy.and.returnValue(asyncData(fakeData.libBookCategories));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    it('should display error when Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCategoriesSpy.and.returnValue(asyncError<string>('Service failed'));

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
