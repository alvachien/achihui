import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTransferDetailComponent } from './document-transfer-detail.component';

describe('DocumentTransferDetailComponent', () => {
  let component: DocumentTransferDetailComponent;
  let fixture: ComponentFixture<DocumentTransferDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTransferDetailComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTransferDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
