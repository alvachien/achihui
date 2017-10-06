import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurrEventComponent } from './recurr-event.component';

describe('RecurrEventComponent', () => {
  let component: RecurrEventComponent;
  let fixture: ComponentFixture<RecurrEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurrEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurrEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
