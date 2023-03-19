import { Component, OnInit, OnDestroy } from "@angular/core";
import { forkJoin, ReplaySubject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import { Router } from "@angular/router";
import { NzModalService } from "ng-zorro-antd/modal";
import { translate } from "@ngneat/transloco";
import * as moment from "moment";

import {
  LogLevel,
  ModelUtility,
  ConsoleLogTypeEnum,
  UIDisplayStringUtil,
  BlogCollection,
  momentDateFormat,
} from "../../../../model";
import { BlogOdataService, UIStatusService } from "../../../../services";

@Component({
  selector: "hih-blog-collection-list",
  templateUrl: "./collection-list.component.html",
  styleUrls: ["./collection-list.component.less"],
})
export class CollectionListComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  dataSet: BlogCollection[] = [];

  constructor(
    private odataService: BlogOdataService,
    private modalService: NzModalService,
    private router: Router
  ) {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering CollectionListComponent constructor...",
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering CollectionListComponent OnInit...",
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllCollections()
      .pipe(
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: BlogCollection[]) => {
          this.dataSet = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering CollectionListComponent ngOnInit, fetchAllCollections failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate("Common.Error"),
            nzContent: error.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering CollectionListComponent OnDestroy...",
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onCreate(): void {
    this.router.navigate(["/blog/collection/create"]);
  }
  onDisplay(rid: number): void {
    this.router.navigate(["/blog/collection/display/" + rid.toString()]);
  }
  onEdit(rid: number): void {
    this.router.navigate(["/blog/collection/edit/" + rid.toString()]);
  }
  onDelete(rid: number) {
    // TBD.
  }
}
