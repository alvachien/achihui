import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalEventListComponent } from './normal-event-list.component';

describe('NormalEventListComponent', () => {
  let component: NormalEventListComponent;
  let fixture: ComponentFixture<NormalEventListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NormalEventListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NormalEventListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
