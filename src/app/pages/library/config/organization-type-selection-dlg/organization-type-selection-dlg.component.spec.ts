import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTypeSelectionDlgComponent } from './organization-type-selection-dlg.component';

describe('OrganizationTypeSelectionDlgComponent', () => {
  let component: OrganizationTypeSelectionDlgComponent;
  let fixture: ComponentFixture<OrganizationTypeSelectionDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationTypeSelectionDlgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTypeSelectionDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
