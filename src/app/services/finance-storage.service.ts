import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import * as moment from 'moment';

import { environment } from '../../environments/environment';
import { LogLevel, AccountCategory, DocumentType, TranType, AssetCategory, Account, ControlCenter, Order,
  Document, DocumentWithPlanExgRateForUpdate, momentDateFormat, TemplateDocADP, AccountStatusEnum, TranTypeReport,
  UINameValuePair, TemplateDocLoan, MonthOnMonthReport,
  GeneralFilterItem, DocumentItemWithBalance, DocumentItem, BaseListModel, ReportTrendExTypeEnum,
  ReportTrendExData, DocumentCreatedFrequenciesByUser, Plan, DocumentWithPlanExgRate, BalanceSheetReport, FinanceNormalDocItemMassCreate,
} from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';

@Injectable()
export class FinanceStorageService {
  // Buffer
  private _listAccount: Account[] = [];

  readonly planAPIUrl: string = environment.ApiUrl + '/FinancePlan';
  readonly documentAPIUrl: string = environment.ApiUrl + '/FinanceDocument';
  readonly documentMassCreateAPIUrl: string = environment.ApiUrl + '/FinanceNormalDocMassCreate';
  readonly accountAPIUrl: string = environment.ApiUrl + '/FinanceAccount';
  readonly controlCenterAPIUrl: string = environment.ApiUrl + '/FinanceControlCenter';
  readonly orderAPIUrl: string = environment.ApiUrl + '/FinanceOrder';
  readonly docItemAPIUrl: string = environment.ApiUrl + '/FinanceDocumentItem';

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefOdataService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering FinanceStorageService constructor...');
    }
  }

  /**
   * Update previous document with planned exchange rate
   * @param obj Object for planned exchange rate
   */
  public updatePreviousDocWithPlanExgRate(obj: DocumentWithPlanExgRateForUpdate): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/FinanceDocWithPlanExgRate';
    const jdata: string = JSON && JSON.stringify(obj);

    return this._http.post(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering updatePreviousDocWithPlanExgRate in FinanceStorageService`);
        }

        // It's an empty Ok();
        return true;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Get tran type report
   */
  public getReportTranType(dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/FinanceReportTranType';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome!.ID.toString());
    if (dtbgn) {
      params = params.append('dtbgn', dtbgn.format(momentDateFormat));
    }
    if (dtend) {
      params = params.append('dtend', dtend.format(momentDateFormat));
    }

    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    })
      .pipe(map((response: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering getReportTranType in FinanceStorageService.`);
        }

        // Do the grouping here.
        let y: any = <any>response;
        let mapOut: Map<number, UINameValuePair<number>> = new Map<number, UINameValuePair<number>>();
        let mapIn: Map<number, UINameValuePair<number>> = new Map<number, UINameValuePair<number>>();

        if (y instanceof Array && y.length > 0) {
          for (let tt of y) {
            let rtt: TranTypeReport = new TranTypeReport();
            rtt.onSetData(tt);

            if (rtt.ExpenseFlag) {
              if (mapOut.has(rtt.TranType)) {
                let val: any = mapOut.get(rtt.TranType);
                val.value += Math.abs(rtt.TranAmount);
                mapOut.set(rtt.TranType, val);
              } else {
                mapOut.set(rtt.TranType, {
                  name: rtt.TranTypeName,
                  value: Math.abs(rtt.TranAmount),
                });
              }
            } else {
              if (mapIn.has(rtt.TranType)) {
                let val: any = mapIn.get(rtt.TranType);
                val.value += Math.abs(rtt.TranAmount);
                mapIn.set(rtt.TranType, val);
              } else {
                mapIn.set(rtt.TranType, {
                  name: rtt.TranTypeName,
                  value: Math.abs(rtt.TranAmount),
                });
              }
            }
          }
        }

        return [mapIn, mapOut];
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }
}
