import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalEventDetailComponent } from './normal-event-detail.component';

describe('NormalEventDetailComponent', () => {
  let component: NormalEventDetailComponent;
  let fixture: ComponentFixture<NormalEventDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NormalEventDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NormalEventDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
