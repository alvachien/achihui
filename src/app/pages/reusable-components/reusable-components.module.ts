import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownEditorComponent } from './markdown-editor/markdown-editor.component';

@NgModule({
  declarations: [
    MarkdownEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [
    MarkdownEditorComponent,
  ]
})
export class ReusableComponentsModule { }
