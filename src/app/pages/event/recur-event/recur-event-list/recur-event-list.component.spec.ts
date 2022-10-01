import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurEventListComponent } from './recur-event-list.component';

describe('RecurEventListComponent', () => {
  let component: RecurEventListComponent;
  let fixture: ComponentFixture<RecurEventListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecurEventListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurEventListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
