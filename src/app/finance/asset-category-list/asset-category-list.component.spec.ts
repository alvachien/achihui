import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCategoryListComponent } from './asset-category-list.component';

describe('AssetCategoryListComponent', () => {
  let component: AssetCategoryListComponent;
  let fixture: ComponentFixture<AssetCategoryListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetCategoryListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
