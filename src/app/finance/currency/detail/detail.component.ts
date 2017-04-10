import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import * as HIHCommon from '../../../model/common';
import * as HIHFinance from '../../../model/financemodel';
import { environment } from '../../../../environments/environment';
import { BufferService } from '../../../services/buff.service';

@Component({
  selector: 'finance-currency-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  private routerID: string; // Current ID in routing
  public currentMode: string;
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Display;
  public currObject: HIHFinance.Currency;

  constructor(
    private _location: Location,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _zone: NgZone,
    private _tranService: TranslateService,
    private _buffService: BufferService) {

    this.currentMode = "Common.Display";
    this.currObject = new HIHFinance.Currency();
  }

  ngOnInit() {
      this._activateRoute.url.subscribe(x => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === "create") {
            // this.currentMode = "Common.Create";
            // this.uiMode = HIHCommon.UIMode.Create;
            this.uiMode = HIHCommon.UIMode.Invalid;
          } else if (x[0].path === "edit") {
            // this.routerID = x[1].path;
            // this.currentMode = "Common.Edit"
            // this.uiMode = HIHCommon.UIMode.Change;
            this.uiMode = HIHCommon.UIMode.Invalid;
          } else if (x[0].path === "display") {
            this.routerID = x[1].path;
            this.currentMode = "Common.Display";
            this.uiMode = HIHCommon.UIMode.Display;
          }
        }

        if (this.uiMode === HIHCommon.UIMode.Display) {
          // Load the account
          this.readCurrency();
        }
      }, error => {
      }, () => {
        // Completed
      });
  }

  onBack() : void {
    this._location.back();
  }

  private readCurrency() {
    for (let curr of this._buffService.arrayCurrency) {
      if (curr.Currency === this.routerID) {
        this._zone.run(() => {
          this.currObject = curr;
        });
        break;
      }
    }
  }
}
