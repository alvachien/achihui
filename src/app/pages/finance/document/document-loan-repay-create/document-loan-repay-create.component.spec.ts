import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentLoanRepayCreateComponent } from './document-loan-repay-create.component';

describe('DocumentLoanRepayCreateComponent', () => {
  let component: DocumentLoanRepayCreateComponent;
  let fixture: ComponentFixture<DocumentLoanRepayCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentLoanRepayCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLoanRepayCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
