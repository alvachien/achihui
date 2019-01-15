import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { HttpLoaderTestFactory } from '../../../testing';
import { EnSentenceListComponent } from './en-sentence-list.component';
import { LearnStorageService } from '../../services';

describe('EnSentenceListComponent', () => {
  let component: EnSentenceListComponent;
  let fixture: ComponentFixture<EnSentenceListComponent>;

  beforeEach(async(() => {
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const lrnStroageService: any = jasmine.createSpyObj('LearnStorageService', [
      'fetchAllEnSentences',
    ]);
    const fetchAllEnSentencesSpy: any = lrnStroageService.fetchAllEnSentences.and.returnValue(of([]));

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
        EnSentenceListComponent,
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
    fixture = TestBed.createComponent(EnSentenceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
