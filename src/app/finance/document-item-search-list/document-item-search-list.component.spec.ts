import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentItemSearchListComponent } from './document-item-search-list.component';

describe('DocumentItemSearchListComponent', () => {
  let component: DocumentItemSearchListComponent;
  let fixture: ComponentFixture<DocumentItemSearchListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentItemSearchListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemSearchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
