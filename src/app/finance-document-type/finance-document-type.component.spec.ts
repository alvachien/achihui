import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceDocumentTypeComponent } from './finance-document-type.component';

describe('FinanceDocumentTypeComponent', () => {
  let component: FinanceDocumentTypeComponent;
  let fixture: ComponentFixture<FinanceDocumentTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceDocumentTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceDocumentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
