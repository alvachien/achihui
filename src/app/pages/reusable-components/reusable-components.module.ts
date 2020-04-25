import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';

import { MarkdownEditorComponent } from './markdown-editor/markdown-editor.component';

@NgModule({
  declarations: [
    MarkdownEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzResizableModule,
    NzCodeEditorModule,
  ],
  exports: [
    MarkdownEditorComponent,
  ]
})
export class ReusableComponentsModule { }
