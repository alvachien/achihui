import { Component, OnInit, OnDestroy, AfterViewInit, NgZone,
   EventEmitter, Input, Output, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, 
  URLSearchParams } from '@angular/http';
import { TdDialogService } from '@covalent/core';
import * as HIHCommon from '../../../model/common';
import * as HIHLearn from '../../../model/learnmodel';
import * as HIHUser from '../../../model/userinfo';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../../../services/uistatus.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'learn-history-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  private routerID: string; // Current history ID in routing
  private _apiUrl: string;
  private arUsers: Array<HIHUser.UserDetail> = [];
  private arObjects: Array<HIHLearn.LearnObject> = [];

  public currentMode: string;
  public historyObject: HIHLearn.LearnHistory = null;
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;
  @Input() elementId: String;

  constructor(private _http: Http,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _zone: NgZone,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService,
    private _uistatus: UIStatusService) {
    this.historyObject = new HIHLearn.LearnHistory();
    this.uiMode = HIHCommon.UIMode.Create;
  }

  ////////////////////////////////////////////
  // Methods for interface methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of LearnHistoryDetail");
    }

    Observable.forkJoin([this.loadUserList(), this.loadObjectList()]).subscribe(x => {

      this._zone.run(() => {
        this.arUsers = x[0];
        this.arObjects = x[1];
      });

      // Distinguish current mode
      this._activateRoute.url.subscribe(x => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === "create") {
            this.currentMode = "Create";
            this.historyObject = new HIHLearn.LearnHistory();
            this.uiMode = HIHCommon.UIMode.Create;
          } else if (x[0].path === "edit") {
            this.currentMode = "Edit"
            this.uiMode = HIHCommon.UIMode.Change;

            this.routerID = x[1].path;
          } else if (x[0].path === "display") {
            this.currentMode = "Display";
            this.uiMode = HIHCommon.UIMode.Display;

            this.routerID = x[1].path;
          }

          // Update the sub module
          this._uistatus.setLearnSubModule(this.currentMode + " History");

          this.readHistory();
        }
      }, error => {
        this._dialogService.openAlert({
          message: error,
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: "Routing error",
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });       
      }, () => {
      });
    }, error => {
        this._dialogService.openAlert({
          message: error,
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: "Loading data",
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });       

    }, () => {

    });
  }

  ////////////////////////////////////////////
  // Methods for UI controls
  ////////////////////////////////////////////
  onObjectIdChanged(): void {
    if (environment.DebugLogging) {
      console.log("Entering onObjectIdChanged of LearnHistoryList");
    }

    for (let obj of this.arObjects) {
      if (+obj.Id === +this.historyObject.ObjectId) {
        this.historyObject.ObjectName = obj.Name;
      }
    }
  }

  onSubmit(): void {
    if (environment.DebugLogging) {
      console.log("Entering onSubmit of LearnObjectDetail");
    }

    // Complete
    this.historyObject.onComplete();

    // Checks
    let context : any = { };
    context.arObjects = this.arObjects;
    context.arUsers = this.arUsers;    
    if (!this.historyObject.onVerify(context)) {
      for(let msg of this.historyObject.VerifiedMsgs) {
        this._dialogService.openAlert({
          message: msg.MsgContent,
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: msg.MsgTitle,
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });       
      }
    }

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized) {
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    }

    let dataJSON = this.historyObject.writeJSONString();
    let apiObject = environment.ApiUrl + "api/learnhistory";
    this._http.post(apiObject, dataJSON, { headers: headers })
      .map(response => response.json())
      .catch(this.handleError)
      .subscribe(x => {
        // It returns a new object with ID filled.
        let nHist = new HIHLearn.LearnHistory();
        nHist.onSetData(x);

        // Navigate.
        this._router.navigate(['/learn/hisotry/display/' + nHist.generateKey()]);
      }, error => {
        this._dialogService.openAlert({
          message: 'Error in creating!',
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: 'Create failed', //OPTIONAL, hides if not provided
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });
      }, () => {
      });   
  }

  ////////////////////////////////////////////
  // Methods for Utility methods
  ////////////////////////////////////////////
  loadUserList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadUserList of LearnHistoryList");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/userdetail";

    return this._http.get(usrApi, { headers: headers })
      .map(this.extractUserData)
      .catch(this.handleError);
      // .subscribe(data => {
      //   if (data instanceof Array) {
      //     this.arUsers = data;
      //   }
      // },
      // error => {
      //   // It should be handled already
      // });
  }

  loadObjectList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadObjectList of LearnHistoryList");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let objApi = environment.ApiUrl + "api/learnobject";

    return this._http.get(objApi, { headers: headers })
      .map(this.extractObjectData)
      .catch(this.handleError);
      // .subscribe(data => {
      //   if (data instanceof Array) {
      //     this.arObjects = data;
      //   }
      // },
      // error => {
      //   // It should be handled already
      // });
  }

  readHistory() : void {
    if (environment.DebugLogging) {
      console.log("Entering readHistory of LearnHistoryList");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let objApi = environment.ApiUrl + "api/learnhistory/" + this.routerID;

    this._http.get(objApi, { headers: headers })
      .map(this.extractHistoryData)
      .catch(this.handleError)
      .subscribe(data => {
        this._zone.run(() => {
          this.historyObject = data;
        });        
      },
      error => {
        // It should be handled already
      });
  }

  private extractUserData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractUserData of LearnHistoryList");
    }

    let body = res.json();
    if (body && body instanceof Array) {
      let sets = new Array<HIHUser.UserDetail>();
      for (let alm of body) {
        let alm2 = new HIHUser.UserDetail();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private extractObjectData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractObjectData of LearnHistoryList");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHLearn.LearnObject>();
      for (let alm of body.contentList) {
        let alm2 = new HIHLearn.LearnObject();
        alm2.onSetData(alm);
        sets.push(alm2);
      }

      return sets;
    }

    return body || {};
  }

  private extractHistoryData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractHistoryData of LearnHistoryList");
    }

    let body = res.json();
    if (body) {
      let hist : HIHLearn.LearnHistory = new HIHLearn.LearnHistory();
      hist.onSetData(body);
      return hist;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of LearnHistoryList");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
