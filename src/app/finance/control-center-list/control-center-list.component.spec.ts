import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlCenterListComponent } from './control-center-list.component';

describe('ControlCenterListComponent', () => {
  let component: ControlCenterListComponent;
  let fixture: ComponentFixture<ControlCenterListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlCenterListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
