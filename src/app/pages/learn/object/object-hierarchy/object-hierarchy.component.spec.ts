import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectHierarchyComponent } from './object-hierarchy.component';

describe('ObjectHierarchyComponent', () => {
  let component: ObjectHierarchyComponent;
  let fixture: ComponentFixture<ObjectHierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectHierarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
