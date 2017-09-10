import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeDetailComponent } from './document-type-detail.component';

describe('DocumentTypeDetailComponent', () => {
  let component: DocumentTypeDetailComponent;
  let fixture: ComponentFixture<DocumentTypeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTypeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTypeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
