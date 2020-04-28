import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { IACMEditorConfig, EditorToolbarButtonEnum } from '../../../reusable-components/markdown-editor';
import { ModelUtility, ConsoleLogTypeEnum, BlogPost, BlogPostStatus_PublishAsPublic, UIMode,
  getUIModeString, 
  BlogCollection} from '../../../../model';
import { BlogOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-blog-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.less'],
})
export class PostDetailComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line: variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  public routerID = -1; // Current object ID in routing
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  
  instancePost: BlogPost;
  inputtedContent: string;
  contentFromChangedEvent: string;
  detailFormGroup: FormGroup;
  listOfCollection: BlogCollection[] = [];

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

  constructor(private odataService: BlogOdataService,
    private activateRoute: ActivatedRoute,
    private router: Router,) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PostDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.detailFormGroup = new FormGroup({
      idControl: new FormControl({value: undefined, disabled: true}),
      titleControl: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      contentControl: new FormControl('', [Validators.required]),
      collectionControl: new FormControl(null),
      tagControl: new FormControl(null),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PostDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe((x: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering PostDetailComponent ngOnInit activateRoute: ${x}`,
        ConsoleLogTypeEnum.debug);

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.uiMode = UIMode.Create;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Change;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }

        this.currentMode = getUIModeString(this.uiMode);
      }

      switch(this.uiMode) {
        case UIMode.Change:
        case UIMode.Display: {
          this.isLoadingResults = true;
          forkJoin([
            this.odataService.fetchAllCollections(),
            this.odataService.readPost(this.routerID)
          ])          
          .pipe(
            takeUntil(this._destroyed$),
            finalize(() => this.isLoadingResults = false)
            )
          .subscribe({
            next: rtns => {
              this.listOfCollection = rtns[0];

              this.detailFormGroup.get('idControl').setValue(rtns[1].id);
              this.detailFormGroup.get('titleControl').setValue(rtns[1].title);
              this.detailFormGroup.get('contentControl').setValue(rtns[1].content);

              if (this.uiMode === UIMode.Display) {
                this.detailFormGroup.disable();
              } else if(this.uiMode === UIMode.Change) {
                this.detailFormGroup.enable();
                this.detailFormGroup.get('idControl').disable();
              }
            },
            error: err => {
              // TBD.
            }
          });
        }
        break;

        case UIMode.Create:
        default: {
          this.isLoadingResults = true;
          this.odataService.fetchAllCollections()
            .pipe(takeUntil(this._destroyed$),
              finalize(() => this.isLoadingResults = false)
            )
            .subscribe({
              next: val => {
                // Do nothing
                this.detailFormGroup.get('idControl').setValue('NEW OBJECT');
                this.listOfCollection = val;
              },
              error: err => {
                // TBD.
              }
            });
        }
        break;
      }
    });
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
            this.router.navigate(['/blog/post/display/' + e.id.toString()]);
          },
          error: err => {
          }
        });
    }
  }
}
