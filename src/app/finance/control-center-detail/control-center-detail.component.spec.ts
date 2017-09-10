import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlCenterDetailComponent } from './control-center-detail.component';

describe('ControlCenterDetailComponent', () => {
  let component: ControlCenterDetailComponent;
  let fixture: ComponentFixture<ControlCenterDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlCenterDetailComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
