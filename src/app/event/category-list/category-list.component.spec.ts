import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpLoaderTestFactory } from '../../../testing';

import { CategoryListComponent } from './category-list.component';
import { EventStorageService } from 'app/services';

describe('EventCategoryListComponent', () => {
  let translate: TranslateService;
  let http: HttpTestingController;
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let stgserviceStub: Partial<EventStorageService>;

  beforeEach(async(() => {
    // Create a spy? No!
    // const stgservice = jasmine.createSpyObj('LibraryStorageService', ['fetchAllBookCategories']);
    // // Make the spy return a synchronous Observable with the test data
    // fetchAllBookCategoriesSpy = stgservice.fetchAllBookCategories.and.returnValue( of([]) );

    stgserviceStub = {};

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient]
          }
        })
      ],
      declarations: [
        CategoryListComponent
      ],
      providers: [
        TranslateService,
        { provide: EventStorageService, useValue: stgserviceStub },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
    fixture.detectChanges();
  });

  it('1. should be created', () => {
    expect(component).toBeTruthy();
  });

  it('2. Display column shall have columns', () => {
    expect(component.displayedColumns.length).toBeGreaterThan(1);
  });
});
