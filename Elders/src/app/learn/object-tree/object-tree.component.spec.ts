import { async, ComponentFixture, TestBed, fakeAsync, inject, tick, flush, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { ObjectTreeComponent } from './object-tree.component';
import { AuthService, HomeDefDetailService, LearnStorageService, UIStatusService, } from '../../services';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';

@Component({selector: 'hih-learn-object-by-category', template: ''})
class ObjectByCategoryComponent {
  @Input() selectedCategory: any;
}

describe('ObjectTreeComponent', () => {
  let component: ObjectTreeComponent;
  let fixture: ComponentFixture<ObjectTreeComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCategoriesSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildLearnCategories();
    fakeData.buildLearnObjects();
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
        ObjectByCategoryComponent,
        ObjectTreeComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateLoader,
        UIStatusService,
        { provide: LearnStorageService, useValue: lrnStorageService },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectTreeComponent);
    component = fixture.componentInstance;
  });

  it('should create without data', () => {
    expect(component).toBeTruthy();
  });

  describe('should display the data', () => {
    beforeEach(() => {
      fetchAllCategoriesSpy.and.returnValue(asyncData(fakeData.learnCategories));
    });

    it('should display the data', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.dataSource.data.length).toBeGreaterThan(0);
    }));
  });
});
