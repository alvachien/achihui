import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceDocumentComponent } from './finance-document.component';

describe('FinanceDocumentComponent', () => {
  let component: FinanceDocumentComponent;
  let fixture: ComponentFixture<FinanceDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
