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
  ReportTrendExData, DocumentCreatedFrequenciesByUser,
  Plan, DocumentWithPlanExgRate, BalanceSheetReport,
  FinanceNormalDocItemMassCreate,
} from '../model';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';

@Injectable()
export class FinanceStorageService {
  // Buffer
  private _listAccount: Account[];

  readonly planAPIUrl: string = environment.ApiUrl + '/api/FinancePlan';
  readonly documentAPIUrl: string = environment.ApiUrl + '/api/FinanceDocument';
  readonly documentMassCreateAPIUrl: string = environment.ApiUrl + '/api/FinanceNormalDocMassCreate';
  readonly accountAPIUrl: string = environment.ApiUrl + '/api/FinanceAccount';
  readonly controlCenterAPIUrl: string = environment.ApiUrl + '/api/FinanceControlCenter';
  readonly orderAPIUrl: string = environment.ApiUrl + '/api/FinanceOrder';
  readonly docItemAPIUrl: string = environment.ApiUrl + '/api/FinanceDocumentItem';

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefOdataService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering FinanceStorageService constructor...');
    }
  }

  /**
   * Update a normal document
   * @param objDetail instance of document which to be created
   */
  public updateNormalDocument(objDetail: Document): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/' + objDetail.Id.toString();

    const jdata: string = objDetail.writeJSONString();
    return this._http.put(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering FinanceStorageService updateNormalDocument, map');
        }

        let hd: Document = new Document();
        hd.onSetData(<any>response);
        return hd;
      }),
      catchError((error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering FinanceStorageService updateNormalDocument, failed.`);
        }

        return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
      }));
  }

  /**
   * Update Loan document
   */
  public updateLoanDocument(jdata: any): void {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/financeloandocument';

    this._http.put(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug('AC_HIH_UI [Debug]: Entering Map of updateLoanDocument in FinanceStorageService: ' + response);
        }

        let hd: Document = new Document();
        hd.onSetData(response as any);
        return hd;
      }))
      .subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Fetch data success in updateLoanDocument in FinanceStorageService: ${x}`);
        }

        // const copiedData: any = this.Documents.slice();
        // copiedData.push(x);
        // this.listDocumentChange.next(copiedData);

      }, (error: HttpErrorResponse) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Error occurred in updateLoanDocument in FinanceStorageService:  ${error}`);
        }

      }, () => {
        // Empty
      });
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

    let apiurl: string = environment.ApiUrl + '/api/FinanceDocWithPlanExgRate';
    const jdata: string = JSON && JSON.stringify(obj);

    return this._http.post(apiurl, jdata, {
      headers: headers,
    })
      .pipe(map((response: HttpResponse<any>) => {
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

    let apiurl: string = environment.ApiUrl + '/api/FinanceReportTranType';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
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
      .pipe(map((response: HttpResponse<any>) => {
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

  /**
   * Get Month on Month report
   */
  public getReportMonthOnMonth(exctran?: boolean, dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<MonthOnMonthReport[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceReportTrend';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    if (exctran) {
      params = params.append('exctran', exctran.toString());
    }
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
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          // console.debug(`AC_HIH_UI [Debug]: Entering getReportMonthOnMonth in FinanceStorageService: ${response}`);
          console.debug(`AC_HIH_UI [Debug]: Entering getReportMonthOnMonth in FinanceStorageService`);
        }

        // Do the grouping here.
        let rst: MonthOnMonthReport[] = [];

        if (response instanceof Array && response.length > 0) {
          for (let tt of response) {
            let mmp: MonthOnMonthReport = new MonthOnMonthReport();
            mmp.onSetData(tt);
            rst.push(mmp);
          }
        }

        return rst;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Fetch trend data of Finance Report
   * @param trendtype Trend type
   * @param exctran Exclude the transfer
   * @param dtbgn Begin date
   * @param dtend End date
   */
  public fetchReportTrendData(trendtype: ReportTrendExTypeEnum, exctran?: boolean,
    dtbgn?: moment.Moment, dtend?: moment.Moment): Observable<ReportTrendExData[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    let apiurl: string = environment.ApiUrl + '/api/FinanceReportTrendEx';
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());
    params = params.append('trendtype', (<number>trendtype).toString());
    if (exctran) {
      params = params.append('exctran', exctran.toString());
    }
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
      .pipe(map((response: HttpResponse<any>) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering fetchReportTrendData in FinanceStorageService.`);
        }

        // Do the grouping here.
        let rst: ReportTrendExData[] = [];

        if (response instanceof Array && response.length > 0) {
          for (let tt of response) {
            let mmp: ReportTrendExData = new ReportTrendExData();
            mmp.onSetData(tt);
            rst.push(mmp);
          }
        }

        return rst;
      }),
      catchError((errresp: HttpErrorResponse) => {
        const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
        return throwError(errmsg);
      }),
      );
  }

  /**
   * Fetch doc posted frequency per user
   */
  public fetchDocPostedFrequencyPerUser(): Observable<DocumentCreatedFrequenciesByUser[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let params: HttpParams = new HttpParams();
    params = params.append('hid', this._homeService.ChosedHome.ID.toString());

    let apiurl: string = environment.ApiUrl + '/api/FinanceDocCreatedFrequenciesByUser';
    return this._http.get(apiurl, {
      headers: headers,
      params: params,
    }).pipe(map((response: HttpResponse<any>) => {
      // Read the data out
      let rst: DocumentCreatedFrequenciesByUser[] = [];

      if (response instanceof Array && response.length > 0) {
        for (let tt of response) {
          let mmp: DocumentCreatedFrequenciesByUser = new DocumentCreatedFrequenciesByUser();
          mmp.onSetData(tt);
          rst.push(mmp);
        }
      }

      return rst;
    }),
    catchError((errresp: HttpErrorResponse) => {
      const errmsg: string = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
      return throwError(errmsg);
    }),
    );
  }
}
