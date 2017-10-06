import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCategoryDetailComponent } from './asset-category-detail.component';

describe('AssetCategoryDetailComponent', () => {
  let component: AssetCategoryDetailComponent;
  let fixture: ComponentFixture<AssetCategoryDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetCategoryDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetCategoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
