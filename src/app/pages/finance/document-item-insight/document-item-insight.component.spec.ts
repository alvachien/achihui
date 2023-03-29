import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentItemInsightComponent } from './document-item-insight.component';

describe('DocumentItemInsightComponent', () => {
  let component: DocumentItemInsightComponent;
  let fixture: ComponentFixture<DocumentItemInsightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentItemInsightComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentItemInsightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
