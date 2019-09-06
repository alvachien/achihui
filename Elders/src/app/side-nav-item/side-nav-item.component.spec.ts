import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HttpLoaderTestFactory, RouterLinkDirectiveStub } from '../../../../src/testing';
import { SideNavItemComponent } from './side-nav-item.component';
import { SideNavService } from '../services';

import { Input, Directive, } from '@angular/core';

@Directive({
  selector: '[routerLinkActiveOptions]',
})
class RouterLinkActiveOptionStubDirective {
  @Input('routerLinkActiveOptions') activeOptions: any;
}

describe('SideNavItemComponent', () => {
  let component: SideNavItemComponent;
  let fixture: ComponentFixture<SideNavItemComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;

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
        RouterLinkDirectiveStub,
        RouterLinkActiveOptionStubDirective,
        SideNavItemComponent,
      ],
      providers: [
        TranslateService,
        SideNavService,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideNavItemComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
