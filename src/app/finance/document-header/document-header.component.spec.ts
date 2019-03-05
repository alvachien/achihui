import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentHeaderComponent } from './document-header.component';

describe('DocumentHeaderComponent', () => {
  let component: DocumentHeaderComponent;
  let fixture: ComponentFixture<DocumentHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
