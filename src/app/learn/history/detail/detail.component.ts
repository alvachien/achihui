import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter, Input, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, URLSearchParams }
  from '@angular/http';
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
    private router: Router,
    private activateRoute: ActivatedRoute,
    private authService: AuthService,
    private uistatus: UIStatusService) {
    this.historyObject = new HIHLearn.LearnHistory();
    this.uiMode = HIHCommon.UIMode.Create;
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of LearnHistoryDetail");
    }

    this.loadUserList();
    this.loadObjectList();

    // Distinguish current mode
    this.activateRoute.url.subscribe(x => {
      if (x instanceof Array && x.length > 0) {
        if (x[0].path === "create") {
          this.currentMode = "Create";
          this.historyObject = new HIHLearn.LearnHistory();
          this.uiMode = HIHCommon.UIMode.Create;
        } else if (x[0].path === "edit") {
          this.currentMode = "Edit"
          this.uiMode = HIHCommon.UIMode.Change;
        } else if (x[0].path === "display") {
          this.currentMode = "Display";
          this.uiMode = HIHCommon.UIMode.Display;
        }

        // Update the sub module
        this.uistatus.setLearnSubModule(this.currentMode + " History");
      }
    }, error => {

    }, () => {

    });

    // let aid: number = -1;
    // this.activateRoute.params.forEach((next: { id: number }) => {
    //     aid = next.id;
    // });

    // if (aid !== -1 && aid != this.routerID) {
    //     this.routerID = aid;        
    // } else if (aid === -1) {
    //   // Create mode
    // }
  }

  loadUserList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadUserList of LearnHistoryList");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this.authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    let usrApi = environment.ApiUrl + "api/userdetail";

    this._http.get(usrApi, { headers: headers })
      .map(this.extractUserData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this.arUsers = data;
        }
      },
      error => {
        // It should be handled already
      });
  }

  loadObjectList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadObjectList of LearnHistoryList");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this.authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    let objApi = environment.ApiUrl + "api/learnobject";

    this._http.get(objApi, { headers: headers })
      .map(this.extractObjectData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this.arUsers = data;
        }
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

  // UI method
  onObjectIdChanged(): void {
    if (environment.DebugLogging) {
      console.log("Entering onObjectIdChanged of LearnHistoryList");
    }

    this.arObjects.forEach((value, index, array) => {
      if (+value.Id === +this.historyObject.ObjectId) {
        this.historyObject.ObjectName = value.Name;
      }
    });
  }
}
