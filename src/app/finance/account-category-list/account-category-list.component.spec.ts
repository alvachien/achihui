import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountCategoryListComponent } from './account-category-list.component';

describe('AccountCategoryListComponent', () => {
  let component: AccountCategoryListComponent;
  let fixture: ComponentFixture<AccountCategoryListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountCategoryListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
