import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import * as HIHCommon from '../../../model/common';
import * as HIHLearn from '../../../model/learnmodel';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../../../services/uistatus.service';

@Component({
  selector: 'learn-category-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  private routerID: number = -1; // Current category ID in routing
  public currentMode: string;
  public detailObject: HIHLearn.LearnCategory = null;
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;

  constructor(private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _http: Http,
    private _uistatus: UIStatusService) {
      this.detailObject = new HIHLearn.LearnCategory();
      this.uiMode = HIHCommon.UIMode.Create;
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of LearnCategoryDetail");
    }
    
    // Distinguish current mode
    this._activateRoute.url.subscribe(x => {
      if (x instanceof Array && x.length > 0) {
        if (x[0].path === "create") {
          this.currentMode = "Create";
          this.detailObject = new HIHLearn.LearnCategory();
          this.uiMode = HIHCommon.UIMode.Create;
        } else if (x[0].path === "edit") {
          this.routerID = +x[1].path;

          this.currentMode = "Edit"
          this.uiMode = HIHCommon.UIMode.Change;
        } else if(x[0].path === "display") {
          this.routerID = +x[1].path;

          this.currentMode = "Display";
          this.uiMode = HIHCommon.UIMode.Display;
        }

        if (this.uiMode === HIHCommon.UIMode.Display || this.uiMode === HIHCommon.UIMode.Change) {
          this.readCategory();
        }

        // Update the sub module
        this._uistatus.setLearnSubModule(this.currentMode + " Category");
      }
    }, error => {
    }, () => {
    });
  }

  private readCategory(): void {

  }
}
