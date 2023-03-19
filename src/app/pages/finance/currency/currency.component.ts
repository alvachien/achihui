import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, merge, of, ReplaySubject } from "rxjs";
import {
  catchError,
  map,
  startWith,
  switchMap,
  takeUntil,
  finalize,
} from "rxjs/operators";
import { NzModalService } from "ng-zorro-antd/modal";
import { translate } from "@ngneat/transloco";

import { Currency, ModelUtility, ConsoleLogTypeEnum } from "../../../model";
import { FinanceOdataService } from "../../../services";

@Component({
  selector: "hih-finance-currency",
  templateUrl: "./currency.component.html",
  styleUrls: ["./currency.component.less"],
})
export class CurrencyComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;
  public dataSource: Currency[] = [];
  isLoadingResults: boolean;

  constructor(
    public currService: FinanceOdataService,
    public modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering CurrencyComponent constructor...`,
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering CurrencyComponent OnInit...`,
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = false;
    this.currService
      .fetchAllCurrencies()
      .pipe(
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering CurrencyComponent OnInit fetchAllCurrencies...`,
            ConsoleLogTypeEnum.debug
          );
          if (x) {
            this.dataSource = x;
          }
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering CurrencyComponent OnInit fetchAllCurrencies, failed ${error}...`,
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
      `AC_HIH_UI [Debug]: Entering CurrencyComponent ngOnDestroy...`,
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
