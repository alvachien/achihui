import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranTypeHierarchyComponent } from './tran-type-hierarchy.component';

describe('TranTypeHierarchyComponent', () => {
  let component: TranTypeHierarchyComponent;
  let fixture: ComponentFixture<TranTypeHierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranTypeHierarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranTypeHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
