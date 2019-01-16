import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HttpLoaderTestFactory, FakeDataHelper } from '../../../testing';
import { ConfigComponent } from './config.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';
import { MatTabGroup } from '@angular/material';

describe('ConfigComponent', () => {
  let component: ConfigComponent;
  let fixture: ComponentFixture<ConfigComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper = new FakeDataHelper();

  beforeEach(async(() => {
    fakeData.buildFinConfigData();
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService',
      ['fetchAllAccountCategories', 'fetchAllDocTypes', 'fetchAllAssetCategories']);
    const fetchAllAccountCategoriesSpy: any = stroageService.fetchAllAccountCategories.and.returnValue(of(fakeData.finAccountCategories));
    const fetchAllDocTypesSpy: any = stroageService.fetchAllDocTypes.and.returnValue(of(fakeData.finDocTypes));
    const fetchAllAssetCategoriesSpy: any = stroageService.fetchAllAssetCategories.and.returnValue(of(fakeData.finAssetCategories));

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
        ConfigComponent,
      ],
      providers: [
        TranslateService,
        { provide: FinanceStorageService, useValue: stroageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create', () => {
    expect(component).toBeTruthy();
  });
  it('2. Check account categories', () => {
    let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;
    // By default is 0
    expect(tabComponent.selectedIndex).toEqual(0);
    expect(component.dataSourceAcntCtgy.data.length).toBeGreaterThan(0);
    expect(component.dataSourceAcntCtgy.data.length).toEqual(fakeData.finAccountCategories.length);
  });
  it('3. Check asset categories', () => {
    let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;
    tabComponent.selectedIndex = 2;
    fixture.detectChanges();
    expect(component.dataSourceAsstCtgy.data.length).toBeGreaterThan(0);
    expect(component.dataSourceAsstCtgy.data.length).toEqual(fakeData.finAssetCategories.length);
  });
  it('4. Check doc types', () => {
    let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;
    tabComponent.selectedIndex = 1;
    fixture.detectChanges();
    expect(component.dataSourceDocType.data.length).toBeGreaterThan(0);
    expect(component.dataSourceDocType.data.length).toEqual(fakeData.finDocTypes.length);
  });
});
