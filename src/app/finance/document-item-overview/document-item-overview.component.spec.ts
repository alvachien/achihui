import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentItemOverviewComponent } from './document-item-overview.component';

describe('DocumentItemOverviewComponent', () => {
  let component: DocumentItemOverviewComponent;
  let fixture: ComponentFixture<DocumentItemOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentItemOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
