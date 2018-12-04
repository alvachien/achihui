import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentNormalCreateComponent } from './document-normal-create.component';

describe('DocumentNormalCreateComponent', () => {
  let component: DocumentNormalCreateComponent;
  let fixture: ComponentFixture<DocumentNormalCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentNormalCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentNormalCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
