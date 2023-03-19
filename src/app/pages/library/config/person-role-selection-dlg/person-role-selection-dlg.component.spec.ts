import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PersonRoleSelectionDlgComponent } from "./person-role-selection-dlg.component";

describe("PersonRoleSelectionDlgComponent", () => {
  let component: PersonRoleSelectionDlgComponent;
  let fixture: ComponentFixture<PersonRoleSelectionDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PersonRoleSelectionDlgComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonRoleSelectionDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
