import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';

import { HttpLoaderTestFactory, FakeDataHelper } from '../../../testing';
import { ControlCenterTreeComponent } from './control-center-tree.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';

@Component({selector: 'hih-fin-docitem-by-cc', template: ''})
class DocItemByCCComponent {
  @Input() selectedControlCenter: any;
  @Input() selectedScope: any;
}

describe('ControlCenterTreeComponent', () => {
  let component: ControlCenterTreeComponent;
  let fixture: ComponentFixture<ControlCenterTreeComponent>;
  let fakeData: FakeDataHelper;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();

    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', ['fetchAllControlCenters']);
    const fetchAllControlCentersSpy: any = stroageService.fetchAllControlCenters.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        BrowserAnimationsModule,
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
        DocItemByCCComponent,
        ControlCenterTreeComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create', () => {
    expect(component).toBeTruthy();
  });
});
