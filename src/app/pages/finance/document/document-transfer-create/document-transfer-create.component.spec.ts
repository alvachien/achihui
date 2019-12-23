import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';

import { DocumentTransferCreateComponent } from './document-transfer-create.component';
import { getTranslocoModule } from '../../../../../testing';

describe('DocumentTransferCreateComponent', () => {
  let component: DocumentTransferCreateComponent;
  let fixture: ComponentFixture<DocumentTransferCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports : [
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [ DocumentTransferCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTransferCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
