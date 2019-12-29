import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { RouterTestingModule } from '@angular/router/testing';

import { AccountCategoryListComponent } from './account-category-list';
import { AssetCategoryListComponent } from './asset-category-list';
import { DocTypeListComponent } from './doc-type-list';
import { TranTypeHierarchyComponent } from './tran-type-hierarchy';
import { TranTypeListComponent } from './tran-type-list';
import { ConfigComponent } from './config.component';
import { getTranslocoModule } from '../../../../testing';

describe('ConfigComponent', () => {
  let component: ConfigComponent;
  let fixture: ComponentFixture<ConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [ 
        AccountCategoryListComponent,
        AssetCategoryListComponent,
        DocTypeListComponent,
        TranTypeHierarchyComponent,
        TranTypeListComponent,
        ConfigComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
