import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { HttpLoaderTestFactory } from '../../../testing';
import { ObjectListComponent } from './object-list.component';
import { LearnStorageService } from '../../services';

describe('ObjectListComponent', () => {
  let component: ObjectListComponent;
  let fixture: ComponentFixture<ObjectListComponent>;

  beforeEach(async(() => {
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const lrnStroageService: any = jasmine.createSpyObj('LearnStorageService', [
      'fetchAllCategories',
      'fetchAllObjects',
    ]);
    const fetchAllCategoriesSpy: any = lrnStroageService.fetchAllCategories.and.returnValue(of([]));
    const fetchAllObjectsSpy: any = lrnStroageService.fetchAllObjects.and.returnValue(of([]));

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
        ObjectListComponent,
      ],
      providers: [
        TranslateService,
        { provide: Router, useValue: routerSpy },
        { provide: LearnStorageService, useValue: lrnStroageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
