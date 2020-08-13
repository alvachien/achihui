import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentItemSearchComponent } from './document-item-search.component';

describe('DocumentItemSearchComponent', () => {
  let component: DocumentItemSearchComponent;
  let fixture: ComponentFixture<DocumentItemSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentItemSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
