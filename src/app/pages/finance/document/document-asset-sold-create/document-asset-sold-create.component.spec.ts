import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';

import { DocumentAssetSoldCreateComponent } from './document-asset-sold-create.component';
import { getTranslocoModule } from '../../../../../testing';

describe('DocumentAssetSoldCreateComponent', () => {
  let component: DocumentAssetSoldCreateComponent;
  let fixture: ComponentFixture<DocumentAssetSoldCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
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
