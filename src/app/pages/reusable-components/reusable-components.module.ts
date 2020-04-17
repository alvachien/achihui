import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';

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
  ],
  exports: [
    MarkdownEditorComponent,
  ]
})
export class ReusableComponentsModule { }
