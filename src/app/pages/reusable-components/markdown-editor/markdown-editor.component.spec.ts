import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';

import { getTranslocoModule } from '../../../../testing';
import { MarkdownEditorComponent } from './markdown-editor.component';

describe('MarkdownEditorComponent', () => {
  let component: MarkdownEditorComponent;
  let fixture: ComponentFixture<MarkdownEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [
        MarkdownEditorComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownEditorComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
