import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';

import { HttpLoaderTestFactory } from '../../../testing';
import { ObjectTreeComponent } from './object-tree.component';
import { AuthService, HomeDefDetailService, LearnStorageService } from '../../services';

@Component({selector: 'hih-learn-object-by-category', template: ''})
class ObjectByCategoryComponent {
  @Input() selectedCategory: any;
}

describe('ObjectTreeComponent', () => {
  let component: ObjectTreeComponent;
  let fixture: ComponentFixture<ObjectTreeComponent>;

  beforeEach(async(() => {
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
        ObjectByCategoryComponent,
        ObjectTreeComponent,
      ],
      providers: [
        TranslateLoader,
        { provide: LearnStorageService, useValue: lrnStroageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
