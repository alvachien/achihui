import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentExchangeDetailComponent } from './document-exchange-detail.component';

describe('DocumentExchangeDetailComponent', () => {
  let component: DocumentExchangeDetailComponent;
  let fixture: ComponentFixture<DocumentExchangeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentExchangeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentExchangeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
