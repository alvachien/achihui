import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconcileByMonthComponent } from './reconcile-by-month.component';

describe('ReconcileByMonthComponent', () => {
  let component: ReconcileByMonthComponent;
  let fixture: ComponentFixture<ReconcileByMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReconcileByMonthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReconcileByMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
