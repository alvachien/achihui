import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentItemByAccountCategoryComponent } from './document-item-by-account-category.component';

describe('DocumentItemByAccountCategoryComponent', () => {
  let component: DocumentItemByAccountCategoryComponent;
  let fixture: ComponentFixture<DocumentItemByAccountCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentItemByAccountCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemByAccountCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
