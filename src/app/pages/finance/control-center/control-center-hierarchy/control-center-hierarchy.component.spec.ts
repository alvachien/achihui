import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlCenterHierarchyComponent } from './control-center-hierarchy.component';

describe('ControlCenterHierarchyComponent', () => {
  let component: ControlCenterHierarchyComponent;
  let fixture: ComponentFixture<ControlCenterHierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlCenterHierarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
