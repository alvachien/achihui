import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';

import { HttpLoaderTestFactory } from '../../testing';
import { SideNavComponent } from './side-nav.component';
import { SideNavService } from '../services';

@Component({ selector: 'hih-sidenav-item', template: '' })
class SideNavItemComponent {
  @Input() item: any;
}

describe('SideNavComponent', () => {
  let component: SideNavComponent;
  let fixture: ComponentFixture<SideNavComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(async(() => {
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.events = new BehaviorSubject([]);

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
        SideNavItemComponent,
        SideNavComponent,
      ],
      providers: [
        SideNavService,
        { provide: Router, useValue: routerSpy },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideNavComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
