import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlCenterTreeComponent } from './control-center-tree.component';

describe('ControlCenterTreeComponent', () => {
  let component: ControlCenterTreeComponent;
  let fixture: ComponentFixture<ControlCenterTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlCenterTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
