import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { LogLevel, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  BlogPost, momentDateFormat, BlogPostStatus_Draft, BlogPostStatus_PublishAsPublic,
  BlogPostStatus_PublishAsPrivate, } from '../../../../model';
import { BlogOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-blog-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.less'],
})
export class PostListComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  pageIndex = 0;
  pageSize = 10;
  totalPostCount = 0;
  dataSet: BlogPost[] = [];

  constructor(
    private odataService: BlogOdataService,
    private modalService: NzModalService,
    private router: Router, ) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PostListComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PostListComponent OnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);
    this.fetchData();
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering PostListComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
  getStatusDisplayString(status: number): string {
    if (status === BlogPostStatus_PublishAsPublic) {
      return 'Common.PublishAsPublic';
    } else if (status === BlogPostStatus_PublishAsPrivate) {
      return 'Common.PublishAsPrivate';
    } else {
      return 'Common.SaveAsDraft';
    }
  }

  public fetchData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 0;
    }

    this.isLoadingResults = true;
    this.odataService.fetchAllPosts(this.pageSize, this.pageIndex * this.pageSize)
      .pipe(takeUntil(this._destroyed$!),
        finalize(() => this.isLoadingResults = false))
      .subscribe({
        next: revdata => {
          if (revdata) {
            if (revdata.totalCount) {
              this.totalPostCount = +revdata.totalCount;
            } else {
              this.totalPostCount = 0;
            }

            this.dataSet = revdata.contentList;
          } else {
            this.totalPostCount = 0;
            this.dataSet = [];
          }
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering PostListComponent ngOnInit, fetchAllPosts failed ${error}`,
            ConsoleLogTypeEnum.error);

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error,
            nzClosable: true,
          });
        },
      });
  }
  onCreate(): void {
    this.router.navigate(['/blog/post/create']);
  }
  onDisplay(rid: number): void {
    this.router.navigate(['/blog/post/display/' + rid.toString()]);
  }
  onEdit(rid: number): void {
    this.router.navigate(['/blog/post/edit/' + rid.toString()]);
  }
  onDelete(rid: number) {
    // TBD.
  }
  onDeploy(rid: number) {
    this.odataService.deployPost(rid).subscribe({
      next: val => {
        const modalRef = this.modalService.success({
          nzTitle: 'Deploy completed without error',
          nzContent: 'Closed in 1 second'
        });
        setTimeout(() => {
          modalRef.close();
        }, 1000);
      },
      error: err => {
        this.modalService.error({
          nzTitle: 'Error',
          nzContent: err,
          nzClosable: true,
        });
      }
    });
  }
  onRevokeDeploy(rid: number) {
    this.odataService.revokeDeployPost(rid).subscribe({
      next: val => {
        const modalRef = this.modalService.success({
          nzTitle: 'Deploy revoked completed without error',
          nzContent: 'Closed in 1 second'
        });
        setTimeout(() => {
          modalRef.close();
        }, 1000);
      },
      error: err => {
        this.modalService.error({
          nzTitle: 'Error',
          nzContent: err,
          nzClosable: true,
        });
      }
    });
  }
}
