import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationSelectionDlgComponent } from './location-selection-dlg.component';

describe('LocationSelectionDlgComponent', () => {
  let component: LocationSelectionDlgComponent;
  let fixture: ComponentFixture<LocationSelectionDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationSelectionDlgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationSelectionDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
