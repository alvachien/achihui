import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRepaymentCreateComponent } from './document-repayment-create.component';

describe('DocumentRepaymentCreateComponent', () => {
  let component: DocumentRepaymentCreateComponent;
  let fixture: ComponentFixture<DocumentRepaymentCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentRepaymentCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentRepaymentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
