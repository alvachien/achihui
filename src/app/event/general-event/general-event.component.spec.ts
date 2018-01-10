import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralEventComponent } from './general-event.component';

describe('GeneralEventComponent', () => {
  let component: GeneralEventComponent;
  let fixture: ComponentFixture<GeneralEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
