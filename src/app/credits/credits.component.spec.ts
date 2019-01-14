import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpLoaderTestFactory } from '../../testing';

import { CreditsComponent } from './credits.component';

describe('CreditsComponent', () => {
  let translate: TranslateService;
  let http: HttpTestingController;
  let fixture: ComponentFixture<CreditsComponent>;
  let component: CreditsComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        CreditsComponent,
      ],
      providers: [TranslateService],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditsComponent);
    component = fixture.debugElement.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);

    fixture.detectChanges();
  });

  it('1. should create', () => {
    expect(component).toBeDefined();
  });

  it('2. Ensure the list is full', () => {
    expect(component.creditApp.length).toBeGreaterThan(1);
  });
});
