import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef, NgZone
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, URLSearchParams }
  from '@angular/http';
import { TdDialogService } from '@covalent/core';
import * as HIHCommon from '../../../model/common';
import * as HIHLearn from '../../../model/learnmodel';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../../../services/uistatus.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'learn-object-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit, AfterViewInit, OnDestroy {

  private routerID: number = -1; // Current category ID in routing
  public currentMode: string;
  public detailObject: HIHLearn.LearnObject = null;
  public arCategory: Array<HIHLearn.LearnCategory> = [];
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;
  @Input() elementId: String;
  @Output() onEditorKeyup = new EventEmitter<any>();

  constructor(
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _http: Http,
    private _zone: NgZone,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService,
    private _uistatus: UIStatusService) {
    if (environment.DebugLogging) {
      console.log("Entering constructor of LearnObjectDetail");
    }

    this.detailObject = new HIHLearn.LearnObject();
    this.uiMode = HIHCommon.UIMode.Create;
  }

  ////////////////////////////////////////////
  // Interface Methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of LearnObjectDetail");
    }
    tinymce.init({
      selector: '#' + this.elementId,
      plugins: ['link', 'paste', 'table'],
      setup: editor => {
        this.editor = editor;
        editor.on('keyup', () => {
          const content = editor.getContent();
          this.onEditorKeyup.emit(content);
        });
      },
    });
  }

  private editor: any = null;

  ngAfterViewInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngAfterViewInit of LearnObjectDetail");
    }
    
    this.loadCategoryList().subscribe(x => {

      // Data
      this.arCategory = x;

      // Distinguish current mode
      this._activateRoute.url.subscribe(x => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === "create") {
            this.currentMode = "Create";
            this.detailObject = new HIHLearn.LearnObject();
            this.uiMode = HIHCommon.UIMode.Create;
          } else if (x[0].path === "edit") {
            this.currentMode = "Edit"
            this.uiMode = HIHCommon.UIMode.Change;

            this.routerID = +x[1].path;
          } else if (x[0].path === "display") {
            this.currentMode = "Display";
            this.uiMode = HIHCommon.UIMode.Display;

            this.routerID = +x[1].path;
          }

          // Update the sub module
          this._uistatus.setLearnSubModule(this.currentMode + " Object");

          if (this.uiMode === HIHCommon.UIMode.Display || this.uiMode === HIHCommon.UIMode.Change) {
            this.readObject();
          }
        }
      }, error => {
        this._dialogService.openAlert({
          message: error,
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: 'Error', //OPTIONAL, hides if not provided
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });
      }, () => {
      });
    }, error => {
      this._dialogService.openAlert({
        message: error,
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: 'Error', //OPTIONAL, hides if not provided
        closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
      });
    }, () => {
    });
  }

  ngOnDestroy() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnDestroy of LearnObjectDetail");
    }

    try {
      tinymce.remove(this.editor);
    }
    catch (e) {
      console.log(e);
    }
  }

  ////////////////////////////////////////////
  // Methods for UI controls
  ////////////////////////////////////////////
  onCategoryValueChange(event): void {
    if (environment.DebugLogging) {
      console.log("Entering onCategoryValueChange of LearnObjectDetail");
    }

    if (this.arCategory && this.arCategory.length > 0) {
      for (let ctgy of this.arCategory) {
        if (+ctgy.Id === +this.detailObject.CategoryId) {
          this.detailObject.CategoryName = ctgy.Name;
        }
      }
    }
  }

  onSubmit(): void {
    if (environment.DebugLogging) {
      console.log("Entering onSubmit of LearnObjectDetail");
    }

    // Checks 
    if (this.arCategory && this.arCategory.length > 0) {
      let bCtgy: boolean = false;
      for (let ctgy of this.arCategory) {
        if (+ctgy.Id === +this.detailObject.CategoryId) {
          bCtgy = true;
        }
      }

      if (!bCtgy) {
        // Error message
        this._dialogService.openAlert({
          message: 'Category need be create first!',
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: 'No category', //OPTIONAL, hides if not provided
          closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
        });

        return;
      }
    } else {
      // Error message
      this._dialogService.openAlert({
        message: 'Category ID is invalid!',
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: 'Invalid category', //OPTIONAL, hides if not provided
        closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
      });

      return;
    }

    if (this.detailObject.Name && this.detailObject.Name.length > 0) {
    } else {
      // Error message
      this._dialogService.openAlert({
        message: 'Name is invalid!',
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: 'Invalid name', //OPTIONAL, hides if not provided
        closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
      });

      return;
    }

    if (this.detailObject.Content && this.detailObject.Content.length > 0) {
    } else {
      // Error message
      this._dialogService.openAlert({
        message: 'Content is invalid!',
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: 'Invalid content', //OPTIONAL, hides if not provided
        closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
      });

      return;
    }

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized) {
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    }

    let dataJSON = this.detailObject.writeJSONString();
    let apiObject = environment.ApiUrl + "api/learnobject";
    this._http.post(apiObject, dataJSON, { headers: headers })
      .map(response => response.json())
      .catch(this.handleError)
      .subscribe(x => {
        // It returns a new object with ID filled.
        let nObj = new HIHLearn.LearnObject();
        nObj.onSetData(x);

        // Navigate.
        this._router.navigate(['/learn/object/display/' + nObj.Id]);
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
  // Utility Methods
  ////////////////////////////////////////////
  private readObject(): void {
    if (environment.DebugLogging) {
      console.log("Entering readObject of LearnObjectDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let objApi = environment.ApiUrl + "api/learnobject/" + this.routerID.toString();

    this._http.get(objApi, { headers: headers })
      .map(this.extractObjectData)
      .catch(this.handleError)
      .subscribe(data => {
        this._zone.run(() => {
          this.detailObject = data;
        });
      },
      error => {
        // It should be handled already
      });
  }
  private loadCategoryList(): Observable<any> {
    if (environment.DebugLogging) {
      console.log("Entering loadCategoryList of LearnObjectDetail");
    }

    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized)
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let objApi = environment.ApiUrl + "api/learncategory";

    return this._http.get(objApi, { headers: headers })
      .map(this.extractCategoryData)
      .catch(this.handleError);
    // .subscribe(data => {
    //   if (data instanceof Array) {
    //     this.arCategory = data;
    //   }
    // },
    // error => {
    //   // It should be handled already
    // });
  }

  private extractCategoryData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractCategoryData of LearnObjectDetail");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHLearn.LearnCategory>();
      for (let alm of body.contentList) {
        let alm2 = new HIHLearn.LearnCategory();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }
  private extractObjectData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractObjectData of LearnObjectDetail");
    }

    let body = res.json();
    if (body) {
      let lo : HIHLearn.LearnObject = new HIHLearn.LearnObject();
      lo.onSetData(body);
      return lo;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of LearnObjectDetail");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
