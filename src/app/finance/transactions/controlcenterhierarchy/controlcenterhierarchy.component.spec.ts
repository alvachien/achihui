import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlcenterhierarchyComponent } from './controlcenterhierarchy.component';

describe('ControlcenterhierarchyComponent', () => {
  let component: ControlcenterhierarchyComponent;
  let fixture: ComponentFixture<ControlcenterhierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlcenterhierarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlcenterhierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
