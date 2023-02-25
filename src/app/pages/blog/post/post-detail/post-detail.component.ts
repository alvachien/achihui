import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import { UIMode } from 'actslib';

import { ModelUtility, ConsoleLogTypeEnum, BlogPost, BlogPostStatus_PublishAsPublic,
  getUIModeString, BlogCollection, BlogPostCollection, BlogPostStatus_PublishAsPrivate,
  BlogPostStatus_Draft, BlogPostTag,
} from '../../../../model';
import { BlogOdataService, } from '../../../../services';

@Component({
  selector: 'hih-blog-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.less'],
})
export class PostDetailComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean = false;
  public routerID = -1; // Current object ID in routing
  public currentMode: string = '';
  public uiMode: UIMode = UIMode.Create;

  instancePost: BlogPost | null = null;
  inputtedContent: string = '';
  contentFromChangedEvent: string = '';
  detailFormGroup: UntypedFormGroup;
  listOfCollection: BlogCollection[] = [];
  listOfTags: BlogPostTag[] = [];

  constructor(private odataService: BlogOdataService,
              private activateRoute: ActivatedRoute,
              private router: Router,
              private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PostDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.detailFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({value: undefined, disabled: true}),
      titleControl: new UntypedFormControl('', [Validators.required, Validators.maxLength(30)]),
      statusControl: new UntypedFormControl('Draft', [Validators.required]),
      contentControl: new UntypedFormControl('', [Validators.required]),
      collectionControl: new UntypedFormControl([]),
      tagControl: new UntypedFormControl(null),
      briefControl: new UntypedFormControl(''),
    });
  }

  get isDeployButtonEnabled(): boolean {
    if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Update) {
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

          this.uiMode = UIMode.Update;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }

        this.currentMode = getUIModeString(this.uiMode);
      }

      switch (this.uiMode) {
        case UIMode.Update:
        case UIMode.Display: {
          this.isLoadingResults = true;
          forkJoin([
            this.odataService.fetchAllCollections(),
            this.odataService.readPost(this.routerID),
            // this.odataService.fetchAllPostTags(10, 0),
          ])
          .pipe(
            takeUntil(this._destroyed$!),
            finalize(() => this.isLoadingResults = false)
            )
          .subscribe({
            next: rtns => {
              this.listOfCollection = rtns[0];

              this.instancePost = rtns[1] as BlogPost;
              this.detailFormGroup.get('idControl')?.setValue(this.instancePost.id);
              this.detailFormGroup.get('titleControl')?.setValue(this.instancePost.title);
              this.detailFormGroup.get('briefControl')?.setValue(this.instancePost.brief);
              this.detailFormGroup.get('contentControl')?.setValue(this.instancePost.content);
              this.detailFormGroup.get('collectionControl')?.setValue(
                this.instancePost.BlogPostCollections.map(val => val.CollectionID));
              this.detailFormGroup.get('tagControl')?.setValue(
                this.instancePost.BlogPostTags.map(val => val.Tag));
              switch (this.instancePost.status) {
                case BlogPostStatus_PublishAsPublic:
                  this.detailFormGroup.get('statusControl')?.setValue('PublicPublish');
                  break;
                case BlogPostStatus_PublishAsPrivate:
                  this.detailFormGroup.get('statusControl')?.setValue('PrivatePublish');
                  break;
                case BlogPostStatus_Draft:
                  default:
                  this.detailFormGroup.get('statusControl')?.setValue('Draft');
                  break;
              }

              if (this.uiMode === UIMode.Display) {
                this.detailFormGroup.disable();
              } else if (this.uiMode === UIMode.Update) {
                this.detailFormGroup.enable();
                this.detailFormGroup.get('idControl')?.disable();
              }
            },
            error: err => {
              ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PostDetailComponent ngOnInit forkJoin failed: ${err}`,
                ConsoleLogTypeEnum.error);

              this.modalService.error({
                nzTitle: translate('Common.Error'),
                nzContent: err.toString(),
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
            .pipe(takeUntil(this._destroyed$!),
              finalize(() => this.isLoadingResults = false)
            )
            .subscribe({
              next: val => {
                // Do nothing
                this.detailFormGroup.get('idControl')?.setValue('NEW OBJECT');
                this.listOfCollection = val;
              },
              error: err => {
                ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PostDetailComponent fetchAllCollections failed: ${err}`,
                  ConsoleLogTypeEnum.error);
                this.modalService.error({
                  nzTitle: translate('Common.Error'),
                  nzContent: err.toString(),
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
      this.instancePost!.title = frmvalue.titleControl;
      this.instancePost!.brief = frmvalue.briefControl;
      this.instancePost!.content = frmvalue.contentControl;
      this.instancePost!.format = 1;
      if (frmvalue.statusControl === 'PublicPublish') {
        this.instancePost!.status = BlogPostStatus_PublishAsPublic;
      } else if (frmvalue.statusControl === 'PrivatePublish') {
        this.instancePost!.status = BlogPostStatus_PublishAsPrivate;
      } else {
        this.instancePost!.status = BlogPostStatus_Draft;
      }
      // Collection
      const arcoll = frmvalue.collectionControl as any[];
      if (arcoll) {
        arcoll.forEach(element => {
          this.instancePost!.BlogPostCollections.push({
            CollectionID: element,
            PostID: this.instancePost!.id,
          } as BlogPostCollection);
        });
      }
      // Tags
      const artags = frmvalue.tagControl as any[];
      if (artags) {
        artags.forEach(tag => {
          this.instancePost!.BlogPostTags.push({
            Tag: tag,
            PostID: this.instancePost!.id,
          } as BlogPostTag);
        });
      }

      if (this.uiMode === UIMode.Create) {
        this.odataService.createPost(this.instancePost!)
        .pipe(takeUntil(this._destroyed$!))
        .subscribe({
          next: e => {
            // Succeed.
            if (this.instancePost!.status === BlogPostStatus_PublishAsPublic) {
              this.modalService.confirm({
                nzTitle: 'Confirm',
                nzContent: 'Deploy the content now?',
                nzOkText: 'OK',
                nzCancelText: 'Cancel',
                nzOnOk: okrst => {
                  this.odataService.deployPost(e.id!).subscribe({
                    next: rst => {
                      // Show success dialog
                      const ref: NzModalRef = this.modalService.success({
                        nzTitle: 'Deploy completed without any error',
                        nzContent: 'Closed in 1 sec',
                      });
                      ref.afterClose.subscribe({
                        next: next => {
                          this.router.navigate(['/blog/post/display/' + e.id!.toString()]);
                        }
                      });
                      setTimeout(() => {
                        ref.close();
                      }, 1000);
                    },
                    error: derr => {
                      // Popup another dialog
                      this.modalService.error({
                        nzTitle: translate('Common.Error'),
                        nzContent: derr.toString(),
                      });
                    }
                  });
                },
                nzOnCancel: cancrst => {
                  this.router.navigate(['/blog/post/display/' + e.id!.toString()]);
                }
              });
            } else {
              this.router.navigate(['/blog/post/display/' + e.id!.toString()]);
            }
          },
          error: err => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PostDetailComponent onSave createPost failed: ${err}`,
              ConsoleLogTypeEnum.error);
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          }
        });
      } else if (this.uiMode === UIMode.Update) {
        this.instancePost!.id = this.routerID;
        this.odataService.changePost(this.instancePost!)
        .pipe(takeUntil(this._destroyed$!))
        .subscribe({
          next: e => {
            // Succeed.
            if (this.instancePost!.status === BlogPostStatus_PublishAsPublic) {
              this.modalService.confirm({
                nzTitle: 'Confirm',
                nzContent: 'Deploy the content now?',
                nzOkText: 'OK',
                nzCancelText: 'Cancel',
                nzOnOk: okrst => {
                  this.odataService.deployPost(e.id!).subscribe({
                    next: rst => {
                      // Show success dialog
                      const ref: NzModalRef = this.modalService.success({
                        nzTitle: 'Deploy completed without any error',
                        nzContent: 'Closed in 1 sec',
                      });
                      ref.afterClose.subscribe({
                        next: next => {
                          this.router.navigate(['/blog/post/display/' + e.id!.toString()]);
                        }
                      });
                      setTimeout(() => {
                        ref.close();
                      }, 1000);
                    },
                    error: derr => {
                      // Popup another dialog
                      this.modalService.error({
                        nzTitle: translate('Common.Error'),
                        nzContent: derr.toString(),
                      });
                    }
                  });
                },
                nzOnCancel: cancrst => {
                  this.router.navigate(['/blog/post/display/' + e.id!.toString()]);
                }
              });
            } else {
              this.router.navigate(['/blog/post/display/' + e.id!.toString()]);
            }
          },
          error: err => {
            ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PostDetailComponent onSave changePost failed: ${err}`,
              ConsoleLogTypeEnum.error);
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          }
        });
      }
    }
  }
}
