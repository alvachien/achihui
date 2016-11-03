import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging } from '../app.setting';
import * as HIHCommon from '../model/common';
import * as HIHFinance from '../model/finance';
import { FinanceService } from '../services/finance.service';
import { DialogService } from '../services/dialog.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'hih-fin-account-detail-dp',
    template: `<div class="panel panel-success" *ngIf="ShowDownpaymentInfo">
                <div class="panel-heading">
                    <h3 class="panel-title"><span>{{'Finance.Downpayment' | translate }}</span></h3>
                </div>

                <div class="panel-body">
                    <div class="form-group">
                        <label class="control-label col-sm-2">{{'Finance.Direction' | translate }}</label>
                        <div class="col-sm-10">
                            <input class="form-control" readonly="readonly" [(ngModel)]="DPAccountInfo.Direct" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="control-label col-sm-2">{{'Finance.BeginDate' | translate }}</label>
                        <div class="col-sm-10">
                            <input class="form-control" readonly="readonly" [(ngModel)]="DPAccountInfo.StartDate" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="control-label col-sm-2">{{'Finance.EndDate' | translate }}</label>
                        <div class="col-sm-10">
                            <input class="form-control" readonly="readonly" [(ngModel)]="DPAccountInfo.EndDate" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="control-label col-sm-2">Repeat Type</label>
                        <div class="col-sm-10">
                            <input class="form-control" readonly="readonly" [(ngModel)]="DPAccountInfo.RepeatType" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="control-label col-sm-2">{{'Finance.RefDoc' | translate }}</label>
                        <div class="col-sm-10">
                            <input class="form-control" readonly="readonly" [(ngModel)]="DPAccountInfo.RefDocID" />
                        </div>
                    </div>

                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>{{'Common.ID' | translate }}</th>
                                <th>{{'Finance.RefDoc' | translate }}</th>
                                <th>{{'Finance.TransactionType' | translate }}</th>
                                <th>{{'Common.Date' | translate }}</th>
                                <th>{{'Finance.Amount' | translate }}</th>
                                <th>{{'Common.Operations' | translate }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let row of DPTmpDoc">
                                <td>{{row.DocID}}</td>
                                <td>{{row.RefDocID}}</td>
                                <td>{{row.TranTypeID}}</td>
                                <td>{{row.TranDate | date}}</td>
                                <td>{{row.Amount | currency}}</td>
                                <td>
                                    <button type="button" class="btn btn-sm" (click)="goDPDoc(row)">
                                        <i class="glyphicon glyphicon-saved">
                                        </i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            A foot of the table
                        </tfoot>
                    </table>
                </div>
            </div>`
})
export class AccountDetailDPComponent implements OnInit, OnDestroy {
    constructor() {
        if (DebugLogging) {
            console.log("Entering constructor of AccountDetailDPComponent");
        }

    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of AccountDetailDPComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of AccountDetailDPComponent");
        }

    }
}
