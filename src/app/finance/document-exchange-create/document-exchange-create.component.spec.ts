import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentExchangeCreateComponent } from './document-exchange-create.component';

describe('DocumentExchangeCreateComponent', () => {
  let component: DocumentExchangeCreateComponent;
  let fixture: ComponentFixture<DocumentExchangeCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentExchangeCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentExchangeCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
