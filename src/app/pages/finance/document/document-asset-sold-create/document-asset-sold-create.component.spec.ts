import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAssetSoldCreateComponent } from './document-asset-sold-create.component';

describe('DocumentAssetSoldCreateComponent', () => {
  let component: DocumentAssetSoldCreateComponent;
  let fixture: ComponentFixture<DocumentAssetSoldCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentAssetSoldCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAssetSoldCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
