import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRepaymentDetailComponent } from './document-repayment-detail.component';

describe('DocumentRepaymentDetailComponent', () => {
  let component: DocumentRepaymentDetailComponent;
  let fixture: ComponentFixture<DocumentRepaymentDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentRepaymentDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentRepaymentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
