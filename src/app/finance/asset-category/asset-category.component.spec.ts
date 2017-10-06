import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCategoryComponent } from './asset-category.component';

describe('AssetCategoryComponent', () => {
  let component: AssetCategoryComponent;
  let fixture: ComponentFixture<AssetCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
