import { async, ComponentFixture, TestBed, fakeAsync, inject, tick, flush, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../../../src/testing';
import { CategoryTreeComponent } from './category-tree.component';
import { AuthService, HomeDefDetailService, LearnStorageService } from '../../services';

describe('CategoryTreeComponent', () => {
  let component: CategoryTreeComponent;
  let fixture: ComponentFixture<CategoryTreeComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCategoriesSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildLearnCategories();
  });

  beforeEach(async(() => {
    const lrnStorageService: any = jasmine.createSpyObj('LearnStorageService', [
      'fetchAllCategories',
    ]);
    fetchAllCategoriesSpy = lrnStorageService.fetchAllCategories.and.returnValue(of([]));

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
        CategoryTreeComponent,
      ],
      providers: [
        TranslateService,
        { provide: LearnStorageService, useValue: lrnStorageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryTreeComponent);
    component = fixture.componentInstance;
  });

  it('should create without data', () => {
    expect(component).toBeTruthy();
  });

  describe('should load the data', () => {
    beforeEach(() => {
      fetchAllCategoriesSpy.and.returnValue(asyncData(fakeData.learnCategories));
    });

    it('shall load the data', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.dataSource.data.length).toBeGreaterThan(0);
    }));
  });
});
