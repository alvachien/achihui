import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettleDialogComponent } from './account-settle-dialog.component';

describe('AccountSettleDialogComponent', () => {
  let component: AccountSettleDialogComponent;
  let fixture: ComponentFixture<AccountSettleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountSettleDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSettleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
