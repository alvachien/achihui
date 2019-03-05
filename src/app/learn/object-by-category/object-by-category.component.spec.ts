import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flush, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, } from '../../../testing';
import { ObjectByCategoryComponent } from './object-by-category.component';
import { AuthService, HomeDefDetailService, LearnStorageService } from '../../services';

describe('ObjectByCategoryComponent', () => {
  let component: ObjectByCategoryComponent;
  let fixture: ComponentFixture<ObjectByCategoryComponent>;
  let fakeData: FakeDataHelper;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildLearnCategories();

    const homeService: any = jasmine.createSpyObj('HomeDefDetailService', ['fetchHomeMembers']);
    homeService.ChosedHome = {
      _id: 1,
      BaseCurrency: 'CNY',
    };
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue([]);
    const lrnStroageService: any = jasmine.createSpyObj('LearnStorageService', [
      'fetchAllCategories',
    ]);
    const fetchAllCategoriesSpy: any = lrnStroageService.fetchAllCategories.and.returnValue(of([]));

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
        ObjectByCategoryComponent,
      ],
      providers: [
        TranslateLoader,
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: LearnStorageService, useValue: lrnStroageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
