import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzUploadModule } from 'ng-zorro-antd/upload';

import { MarkdownEditorComponent } from './markdown-editor/markdown-editor.component';
import { OperatorFilterPipe } from './pipes';

@NgModule({
  declarations: [MarkdownEditorComponent, OperatorFilterPipe],
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzResizableModule,
    NzCodeEditorModule,
    NzGridModule,
    NzUploadModule,
    MarkdownModule.forChild(),
  ],
  exports: [MarkdownEditorComponent, OperatorFilterPipe, MarkdownModule],
})
export class ReusableComponentsModule {}
