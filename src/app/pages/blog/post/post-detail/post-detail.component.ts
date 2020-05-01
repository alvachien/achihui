import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { IACMEditorConfig, EditorToolbarButtonEnum } from '../../../reusable-components/markdown-editor';
import { ModelUtility, ConsoleLogTypeEnum, BlogPost, BlogPostStatus_PublishAsPublic, UIMode,
  getUIModeString, 
  BlogCollection,
  BlogPostCollection,
  BlogPostStatus_PublishAsPrivate,
  BlogPostStatus_Draft} from '../../../../model';
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
      statusControl: new FormControl('Draft', [Validators.required]),
      contentControl: new FormControl('', [Validators.required]),
      collectionControl: new FormControl([]),
      tagControl: new FormControl(null),
      briefControl: new FormControl(''),
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
            this.odataService.readPost(this.routerID),
            // this.odataService.fetchAllPostTags(10, 0),
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
              this.detailFormGroup.get('briefControl').setValue(rtns[1].brief);
              this.detailFormGroup.get('contentControl').setValue(rtns[1].content);
              this.detailFormGroup.get('collectionControl').setValue(rtns[1].BlogPostCollections.map(val => { return val.CollectionID; }));
              switch (rtns[1].status) {
                case BlogPostStatus_PublishAsPublic:
                  this.detailFormGroup.get('statusControl').setValue('PublicPublish');
                  break;
                case BlogPostStatus_PublishAsPrivate:
                  this.detailFormGroup.get('statusControl').setValue('PrivatePublish');
                  break;
                case BlogPostStatus_Draft:
                  default:
                  this.detailFormGroup.get('statusControl').setValue('Draft');
                  break;
              }

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
                ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PostDetailComponent fetchAllCollections failed: ${err}`,
                  ConsoleLogTypeEnum.error);
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
      this.instancePost.brief = frmvalue.briefControl;
      this.instancePost.content = frmvalue.contentControl;
      this.instancePost.format = 1;
      if (frmvalue.statusControl === 'PublicPublish') {
        this.instancePost.status = BlogPostStatus_PublishAsPublic;
      } else if (frmvalue.statusControl === 'PrivatePublish') {
        this.instancePost.status = BlogPostStatus_PublishAsPrivate;
      } else {
        this.instancePost.status = BlogPostStatus_Draft;
      }
      let arcoll = frmvalue.collectionControl as any[];
      arcoll.forEach(element => {
        this.instancePost.BlogPostCollections.push({
          CollectionID: element,
        } as BlogPostCollection);
      });
      
      this.odataService.createPost(this.instancePost)
        .pipe(takeUntil(this._destroyed$))
        .subscribe({
          next: e => {
            // Succeed.
            this.router.navigate(['/blog/post/display/' + e.id.toString()]);
          },
          error: err => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PostDetailComponent onSave failed: ${err}`,
              ConsoleLogTypeEnum.error);
          }
        });
    }
  }
}
