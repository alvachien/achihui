import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { AboutComponent } from './about.component';
import { environment } from '../../environments/environment';
import { HttpLoaderTestFactory } from '../../testing';

describe('AboutComponent', () => {
  let translate: TranslateService;
  let http: HttpTestingController;
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async(() => {
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
        AboutComponent
      ],
      providers: [TranslateService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.debugElement.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);

    fixture.detectChanges();
  });

  it('1. should create', () => {
    expect(component).toBeTruthy();
  });

  it('2. check current version', () => {
    // spyOn(translate, 'getBrowserLang').and.returnValue('en');

    const compiled = fixture.debugElement.nativeElement;
    const p = compiled.querySelector('#curversion');
    expect(p.textContent).toEqual('Nav.Version: ' + environment.CurrentVersion);

    translate.use('en');
    http.expectOne('/assets/i18n/en.json').flush({
      'Nav': {
        'Version': 'Version'
      }
    });
    http.verify();

    fixture.detectChanges();

    // the content should be translated to english now
    expect(p.textContent).toContain('Version: ' + environment.CurrentVersion);
  });
});
