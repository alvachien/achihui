import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountExtraAssetComponent } from './account-extra-asset.component';

describe('AccountExtraAssetComponent', () => {
  let component: AccountExtraAssetComponent;
  let fixture: ComponentFixture<AccountExtraAssetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountExtraAssetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtraAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
