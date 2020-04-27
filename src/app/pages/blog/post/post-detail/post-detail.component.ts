import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IACMEditorConfig, EditorToolbarButtonEnum } from '../../../reusable-components/markdown-editor';
import { ModelUtility, ConsoleLogTypeEnum, BlogPost, BlogPostStatus_PublishAsPublic } from '../../../../model';
import { BlogOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-blog-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.less'],
})
export class PostDetailComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line: variable-name
  private _destroyed$: ReplaySubject<boolean>;
  
  instancePost: BlogPost;
  inputtedContent: string;
  contentFromChangedEvent: string;
  detailFormGroup: FormGroup;

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

  constructor(private odataService: BlogOdataService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PostDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.detailFormGroup = new FormGroup({
      idControl: new FormControl(),
      titleControl: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      contentControl: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PostDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
  }
  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PostDetailComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSave() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PostDetailComponent onSave...',
      ConsoleLogTypeEnum.debug);
    
    if (this.detailFormGroup.valid) {
      let frmvalue = this.detailFormGroup.value;
      this.instancePost = new BlogPost();
      this.instancePost.title = frmvalue.titleControl;
      this.instancePost.content = frmvalue.contentControl;
      this.instancePost.format = 1;
      this.instancePost.status = BlogPostStatus_PublishAsPublic;
      
      this.odataService.createPost(this.instancePost)
        .pipe(takeUntil(this._destroyed$))
        .subscribe({
          next: e => {
            // Succeed.
          },
          error: err => {

          }
        })
    }
  }
}
