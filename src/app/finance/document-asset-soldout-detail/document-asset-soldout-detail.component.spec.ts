import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAssetSoldoutDetailComponent } from './document-asset-soldout-detail.component';

describe('DocumentAssetSoldoutDetailComponent', () => {
  let component: DocumentAssetSoldoutDetailComponent;
  let fixture: ComponentFixture<DocumentAssetSoldoutDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentAssetSoldoutDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAssetSoldoutDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
