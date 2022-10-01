import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurEventDetailComponent } from './recur-event-detail.component';

describe('RecurEventDetailComponent', () => {
  let component: RecurEventDetailComponent;
  let fixture: ComponentFixture<RecurEventDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecurEventDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurEventDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
