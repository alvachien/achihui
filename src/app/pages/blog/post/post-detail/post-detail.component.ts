import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, NzModalRef } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { ModelUtility, ConsoleLogTypeEnum, BlogPost, BlogPostStatus_PublishAsPublic, UIMode,
  getUIModeString, BlogCollection, BlogPostCollection, BlogPostStatus_PublishAsPrivate,
  BlogPostStatus_Draft,
} from '../../../../model';
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

  // editorConfig: IACMEditorConfig = {
  //   toolbarItems: [
  //     EditorToolbarButtonEnum.bold,
  //     EditorToolbarButtonEnum.italic,
  //     EditorToolbarButtonEnum.underline,
  //     EditorToolbarButtonEnum.strikethrough,
  //     EditorToolbarButtonEnum.heading1,
  //     EditorToolbarButtonEnum.heading2,
  //     EditorToolbarButtonEnum.heading3,
  //     EditorToolbarButtonEnum.paragraph,
  //     EditorToolbarButtonEnum.quote,
  //     // EditorToolbarButtonEnum.orderedlist,
  //     // EditorToolbarButtonEnum.unorderedlist,
  //     EditorToolbarButtonEnum.code,
  //     EditorToolbarButtonEnum.math,
  //   ],
  //   height: 300,
  // };

  constructor(private odataService: BlogOdataService,
              private activateRoute: ActivatedRoute,
              private router: Router,
              private modalService: NzModalService) {
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

  get isDeployButtonEnabled(): boolean {
    if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
      return this.detailFormGroup.valid;
    }
    return false;
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

      switch (this.uiMode) {
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

              this.instancePost = rtns[1] as BlogPost;
              this.detailFormGroup.get('idControl').setValue(this.instancePost.id);
              this.detailFormGroup.get('titleControl').setValue(this.instancePost.title);
              this.detailFormGroup.get('briefControl').setValue(this.instancePost.brief);
              this.detailFormGroup.get('contentControl').setValue(this.instancePost.content);
              this.detailFormGroup.get('collectionControl').setValue(
                this.instancePost.BlogPostCollections.map(val => val.CollectionID));
              switch (this.instancePost.status) {
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
              } else if (this.uiMode === UIMode.Change) {
                this.detailFormGroup.enable();
                this.detailFormGroup.get('idControl').disable();
              }
            },
            error: err => {
              ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PostDetailComponent ngOnInit forkJoin failed: ${err}`,
                ConsoleLogTypeEnum.error);

              this.modalService.error({
                nzTitle: translate('Common.Error'),
                nzContent: err,
                nzClosable: true,
              });
            }
          });
          break;
        }

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
                ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PostDetailComponent fetchAllCollections failed: ${err}`,
                  ConsoleLogTypeEnum.error);
                this.modalService.error({
                  nzTitle: translate('Common.Error'),
                  nzContent: err,
                  nzClosable: true,
                });
              }
            });
          break;
        }
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
      const frmvalue = this.detailFormGroup.value;
      if (this.uiMode === UIMode.Create) {
        this.instancePost = new BlogPost();
      }
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
      const arcoll = frmvalue.collectionControl as any[];
      arcoll.forEach(element => {
        this.instancePost.BlogPostCollections.push({
          CollectionID: element,
          PostID: this.instancePost.id,
        } as BlogPostCollection);
      });

      if (this.uiMode === UIMode.Create) {
        this.odataService.createPost(this.instancePost)
        .pipe(takeUntil(this._destroyed$))
        .subscribe({
          next: e => {
            // Succeed.
            if (this.instancePost.status === BlogPostStatus_PublishAsPublic) {
              this.modalService.confirm({
                nzTitle: 'Confirm',
                nzContent: 'Deploy the content now?',
                nzOkText: 'OK',
                nzCancelText: 'Cancel',
                nzOnOk: okrst => {
                  this.odataService.deployPost(e.id).subscribe({
                    next: rst => {
                      // Show success dialog
                      const ref: NzModalRef = this.modalService.success({
                        nzTitle: 'Deploy completed without any error',
                        nzContent: 'Closed in 1 sec',
                      });
                      ref.afterClose.subscribe({
                        next: next => {
                          this.router.navigate(['/blog/post/display/' + e.id.toString()]);
                        }
                      });
                      setTimeout(() => {
                        ref.close();
                      }, 1000);
                    },
                    error: derr => {
                      // Popup another dialog
                      this.modalService.error({
                        nzTitle: 'Error',
                        nzContent: derr,
                      });
                    }
                  });
                },
                nzOnCancel: cancrst => {
                  this.router.navigate(['/blog/post/display/' + e.id.toString()]);
                }
              });
            } else {
              this.router.navigate(['/blog/post/display/' + e.id.toString()]);
            }
          },
          error: err => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PostDetailComponent onSave createPost failed: ${err}`,
              ConsoleLogTypeEnum.error);
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err,
              nzClosable: true,
            });
          }
        });
      } else if (this.uiMode === UIMode.Change) {
        this.instancePost.id = this.routerID;
        this.odataService.changePost(this.instancePost)
        .pipe(takeUntil(this._destroyed$))
        .subscribe({
          next: e => {
            // Succeed.
            if (this.instancePost.status === BlogPostStatus_PublishAsPublic) {
              this.modalService.confirm({
                nzTitle: 'Confirm',
                nzContent: 'Deploy the content now?',
                nzOkText: 'OK',
                nzCancelText: 'Cancel',
                nzOnOk: okrst => {
                  this.odataService.deployPost(e.id).subscribe({
                    next: rst => {
                      // Show success dialog
                      const ref: NzModalRef = this.modalService.success({
                        nzTitle: 'Deploy completed without any error',
                        nzContent: 'Closed in 1 sec',
                      });
                      ref.afterClose.subscribe({
                        next: next => {
                          this.router.navigate(['/blog/post/display/' + e.id.toString()]);
                        }
                      });
                      setTimeout(() => {
                        ref.close();
                      }, 1000);
                    },
                    error: derr => {
                      // Popup another dialog
                      this.modalService.error({
                        nzTitle: 'Error',
                        nzContent: derr,
                      });
                    }
                  });
                },
                nzOnCancel: cancrst => {
                  this.router.navigate(['/blog/post/display/' + e.id.toString()]);
                }
              });
            } else {
              this.router.navigate(['/blog/post/display/' + e.id.toString()]);
            }
          },
          error: err => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PostDetailComponent onSave changePost failed: ${err}`,
              ConsoleLogTypeEnum.error);
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err,
              nzClosable: true,
            });
          }
        });
      }
    }
  }
}
