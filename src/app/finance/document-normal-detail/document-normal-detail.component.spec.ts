import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentNormalDetailComponent } from './document-normal-detail.component';

describe('DocumentNormalDetailComponent', () => {
  let component: DocumentNormalDetailComponent;
  let fixture: ComponentFixture<DocumentNormalDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentNormalDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentNormalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
