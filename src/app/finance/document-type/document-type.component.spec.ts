import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeComponent } from './document-type.component';

describe('DocumentTypeComponent', () => {
  let component: DocumentTypeComponent;
  let fixture: ComponentFixture<DocumentTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
