import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurrEventListComponent } from './recurr-event-list.component';

describe('RecurrEventListComponent', () => {
  let component: RecurrEventListComponent;
  let fixture: ComponentFixture<RecurrEventListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurrEventListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurrEventListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
