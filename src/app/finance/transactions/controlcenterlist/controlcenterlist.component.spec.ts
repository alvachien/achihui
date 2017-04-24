import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlcenterlistComponent } from './controlcenterlist.component';

describe('ControlcenterlistComponent', () => {
  let component: ControlcenterlistComponent;
  let fixture: ComponentFixture<ControlcenterlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlcenterlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlcenterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
