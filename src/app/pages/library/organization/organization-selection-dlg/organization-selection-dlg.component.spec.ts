import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationSelectionDlgComponent } from './organization-selection-dlg.component';

describe('OrganizationSelectionDlgComponent', () => {
  let component: OrganizationSelectionDlgComponent;
  let fixture: ComponentFixture<OrganizationSelectionDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationSelectionDlgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationSelectionDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
