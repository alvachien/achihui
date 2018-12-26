import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRepaymentExCreateComponent } from './document-repayment-ex-create.component';

describe('DocumentRepaymentExCreateComponent', () => {
  let component: DocumentRepaymentExCreateComponent;
  let fixture: ComponentFixture<DocumentRepaymentExCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentRepaymentExCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentRepaymentExCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
