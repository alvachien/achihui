import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccounthierarchyComponent } from './accounthierarchy.component';

describe('AccounthierarchyComponent', () => {
  let component: AccounthierarchyComponent;
  let fixture: ComponentFixture<AccounthierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccounthierarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccounthierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
