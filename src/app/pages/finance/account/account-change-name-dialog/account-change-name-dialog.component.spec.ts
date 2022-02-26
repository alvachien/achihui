import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountChangeNameDialogComponent } from './account-change-name-dialog.component';

describe('AccountChangeNameDialogComponent', () => {
  let component: AccountChangeNameDialogComponent;
  let fixture: ComponentFixture<AccountChangeNameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountChangeNameDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountChangeNameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
