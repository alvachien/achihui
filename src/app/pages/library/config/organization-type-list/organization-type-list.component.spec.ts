import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTypeListComponent } from './organization-type-list.component';

describe('OrganizationTypeListComponent', () => {
  let component: OrganizationTypeListComponent;
  let fixture: ComponentFixture<OrganizationTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationTypeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
