import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTransferCreateComponent } from './document-transfer-create.component';

describe('DocumentTransferCreateComponent', () => {
  let component: DocumentTransferCreateComponent;
  let fixture: ComponentFixture<DocumentTransferCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTransferCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTransferCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
