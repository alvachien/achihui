import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAssetValueChangeCreateComponent } from './document-asset-value-change-create.component';

describe('DocumentAssetValueChangeCreateComponent', () => {
  let component: DocumentAssetValueChangeCreateComponent;
  let fixture: ComponentFixture<DocumentAssetValueChangeCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentAssetValueChangeCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAssetValueChangeCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
