import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentLoanDetailComponent } from './document-loan-detail.component';

describe('DocumentLoanDetailComponent', () => {
  let component: DocumentLoanDetailComponent;
  let fixture: ComponentFixture<DocumentLoanDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentLoanDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLoanDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
