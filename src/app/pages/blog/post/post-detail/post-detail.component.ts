import { Component, OnInit } from '@angular/core';
import { IACMEditorConfig, EditorToolbarButtonEnum } from '../../../reusable-components/markdown-editor';
import { ModelUtility, ConsoleLogTypeEnum } from '../../../../model';

@Component({
  selector: 'hih-blog-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.less'],
})
export class PostDetailComponent implements OnInit {
  inputtedContent: string;
  contentFromChangedEvent: string;
  editorConfig: IACMEditorConfig = {
    toolbarItems: [
      EditorToolbarButtonEnum.bold,
      EditorToolbarButtonEnum.italic,
      EditorToolbarButtonEnum.underline,
      EditorToolbarButtonEnum.strikethrough,
      EditorToolbarButtonEnum.heading1,
      EditorToolbarButtonEnum.heading2,
      EditorToolbarButtonEnum.heading3,
      EditorToolbarButtonEnum.paragraph,
      EditorToolbarButtonEnum.quote,
      // EditorToolbarButtonEnum.orderedlist,
      // EditorToolbarButtonEnum.unorderedlist,
      EditorToolbarButtonEnum.code,
      EditorToolbarButtonEnum.math,
    ],
    height: 300,
  };

  constructor() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PostDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PostDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
  }
}
