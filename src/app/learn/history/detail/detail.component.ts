import { Location } from '@angular/common';
import {
  Component, OnInit, OnDestroy, AfterViewInit, NgZone,
  EventEmitter, Input, Output, ViewContainerRef 
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Http, Headers, Response, RequestOptions,
  URLSearchParams
} from '@angular/http';
import { FormControl } from '@angular/forms';
import { TdDialogService } from '@covalent/core';
import * as HIHCommon from '../../../model/common';
import * as HIHLearn from '../../../model/learnmodel';
import * as HIHUser from '../../../model/userinfo';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../../../services/uistatus.service';
import { AuthService } from '../../../services/auth.service';
import { BufferService } from '../../../services/buff.service';

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
  public controlObjectID: FormControl; 
  public filteredObjects: Observable<HIHLearn.LearnObject[]>;

  constructor(private _http: Http,
    private _location: Location,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _zone: NgZone,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService,
    private _buffService: BufferService,
    private _uistatus: UIStatusService) {

    this._apiUrl = environment.ApiUrl + "/api/learnhistory";
    this.historyObject = new HIHLearn.LearnHistory();
    this.uiMode = HIHCommon.UIMode.Create;
    this.controlObjectID = new FormControl();
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

      this.filteredObjects = this.controlObjectID.valueChanges
         .startWith(null)
         .map(lrnobj => {
            return lrnobj && lrnobj instanceof HIHLearn.LearnObject ? lrnobj.Name : lrnobj;
         })
         .map(name => this.filter(name));

      // Distinguish current mode
      this._activateRoute.url.subscribe(x => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === "create") {
            this.currentMode = "Common.Create";
            this.historyObject = new HIHLearn.LearnHistory();
            this.uiMode = HIHCommon.UIMode.Create;
            this.controlObjectID.enable();
          } else if (x[0].path === "edit") {
            this.currentMode = "Common.Edit"
            this.uiMode = HIHCommon.UIMode.Change;
            this.controlObjectID.enable();

            this.routerID = x[1].path;
          } else if (x[0].path === "display") {
            this.currentMode = "Common.Display";
            this.uiMode = HIHCommon.UIMode.Display;
            this.controlObjectID.disable();

            this.routerID = x[1].path;
          }

          this._uistatus.setLearnModule("Learning.LearningHistory");
          this._uistatus.setLearnSubModule(this.currentMode);

          if (this.uiMode === HIHCommon.UIMode.Change 
            || this.uiMode === HIHCommon.UIMode.Display) {
            this.readHistory();
          }
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
  onObjectSelectionChanged(lrnobj: HIHLearn.LearnObject): void {
    if (environment.DebugLogging) {
      console.log("Entering onObjectSelectionChanged of LearnHistoryDetail");
    }

    if (!lrnobj)
      return;

    for (let obj of this.arObjects) {
      if (+obj.Id === +lrnobj.Id) {
        this.historyObject.ObjectId = obj.Id;
        this.historyObject.ObjectName = obj.Name;
      }
    }
  }

  onSubmit(): void {
    if (this.uiMode === HIHCommon.UIMode.Change
      || this.uiMode === HIHCommon.UIMode.Create) {
    } else {
      return;
    }

    if (environment.DebugLogging) {
      console.log("Entering onSubmit of LearnHistoryDetail");
    }

    // Complete
    if (this.controlObjectID.value && this.controlObjectID.value instanceof HIHLearn.LearnObject) {
      this.historyObject.ObjectId = this.controlObjectID.value.Id;
    }
    this.historyObject.onComplete();

    // Checks
    let context: any = {};
    context.arObjects = this.arObjects;
    context.arUsers = this.arUsers;
    if (!this.historyObject.onVerify(context)) {
      for (let msg of this.historyObject.VerifiedMsgs) {
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

    if (this.uiMode === HIHCommon.UIMode.Create) {
      this._http.post(this._apiUrl, dataJSON, { headers: headers })
        .map(response => response.json())
        .catch(this.handleError)
        .subscribe(x => {
          // It returns a new object with ID filled.
          let nHist = new HIHLearn.LearnHistory();
          nHist.onSetData(x);

          // Navigate.
          this._router.navigate(['/learn/history/display/' + nHist.generateKey()]);
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
    } else if (this.uiMode === HIHCommon.UIMode.Change) {
      this._http.put(this._apiUrl, dataJSON, { headers: headers })
        .map(response => response.json())
        .catch(this.handleError)
        .subscribe(x => {
          // It returns a new object with ID filled.
          let nHist = new HIHLearn.LearnHistory();
          nHist.onSetData(x);

          // Navigate.
          this._router.navigate(['/learn/history/display/' + nHist.generateKey()]);
        }, error => {
          this._dialogService.openAlert({
            message: 'Error in Changing!',
            disableClose: false, // defaults to false
            viewContainerRef: this._viewContainerRef, //OPTIONAL
            title: 'Change failed', //OPTIONAL, hides if not provided
            closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
          });
        }, () => {
        });
    }
  }

  onBack(): void {
    if (environment.DebugLogging) {
      console.log("Entering onBack of LearnHistoryDetail");
    }

    this._location.back();
  }

  ////////////////////////////////////////////
  // Methods for Utility methods
  ////////////////////////////////////////////
  IsUIEditable() {
    return HIHCommon.isUIEditable(this.uiMode);
  }

  loadUserList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadUserList of LearnHistoryDetail");
    }

    return this._buffService.getUsers();
  }

  loadObjectList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadObjectList of LearnHistoryDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let objApi = environment.ApiUrl + "/api/learnobject";

    return this._http.get(objApi, { headers: headers })
      .map(this.extractObjectData)
      .catch(this.handleError);
  }

  readHistory(): void {
    if (environment.DebugLogging) {
      console.log("Entering readHistory of LearnHistoryDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let objApi = this._apiUrl + "/" + this.routerID;

    this._http.get(objApi, { headers: headers })
      .map(this.extractHistoryData)
      .catch(this.handleError)
      .subscribe(data => {
        this._zone.run(() => {
          this.historyObject = data;
          for(let lo of this.arObjects) {
            if (lo.Id === this.historyObject.ObjectId) {
              this.controlObjectID.setValue(lo);
              break;
            }
          }
        });
      },
      error => {
        // It should be handled already
      });
  }
  private filter(val: string) {
    return val ? this.arObjects.filter(obj => new RegExp(`^${val}`, 'gi').test(obj.Name))
               : this.arObjects; 
  }

  public displayFn(obj: HIHLearn.LearnObject): string {
    return obj && obj instanceof HIHLearn.LearnObject ? obj.Id.toString() + " - " + obj.Name : "";
  }

  private extractObjectData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractObjectData of LearnHistoryDetail");
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
      console.log("Entering extractHistoryData of LearnHistoryDetail");
    }

    let body = res.json();
    if (body) {
      let hist: HIHLearn.LearnHistory = new HIHLearn.LearnHistory();
      hist.onSetData(body);
      return hist;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of LearnHistoryDetail");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
