import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';
import * as moment from 'moment';

import { LogLevel, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  BlogPost, momentDateFormat, } from '../../../../model';
import { BlogOdataService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-blog-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.less']
})
export class PostListComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line: variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults = false;
  pageIndex = 0;
  pageSize = 10;
  totalPostCount = 0;
  dataSet: BlogPost[] = [];

  constructor(
    private odataService: BlogOdataService,
    private modalService: NzModalService,
    private router: Router,) {
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

  public fetchData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 0;
    }

    this.isLoadingResults = true;
    this.odataService.fetchAllPosts(this.pageSize, this.pageIndex * this.pageSize)
      .pipe(takeUntil(this._destroyed$),
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
  onCreate(rid: number): void {
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
}
