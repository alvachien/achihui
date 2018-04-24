import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentItemByAccountComponent } from './document-item-by-account.component';

describe('DocumentItemByAccountComponent', () => {
  let component: DocumentItemByAccountComponent;
  let fixture: ComponentFixture<DocumentItemByAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentItemByAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemByAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
