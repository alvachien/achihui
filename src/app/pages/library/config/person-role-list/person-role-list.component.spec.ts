import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonRoleListComponent } from './person-role-list.component';

describe('PersonRoleListComponent', () => {
  let component: PersonRoleListComponent;
  let fixture: ComponentFixture<PersonRoleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonRoleListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonRoleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
