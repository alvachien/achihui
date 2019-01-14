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

import { HttpLoaderTestFactory } from '../../../testing';
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

  beforeEach(async(() => {
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', ['fetchAllControlCenters']);
    const fetchAllControlCentersSpy: any = stroageService.fetchAllControlCenters.and.returnValue(of([]));
    const homeService: any = jasmine.createSpyObj('HomeDefService', ['ChosedHome']);
    const chosedHomeSpy: any = homeService.ChosedHome.and.returnValue( {
      _id: 1,
    });
    const uiServiceStub: Partial<UIStatusService> = {};

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
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: UIStatusService, useValue: uiServiceStub },
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
