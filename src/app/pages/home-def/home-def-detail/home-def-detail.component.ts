import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';

import { HomeDef, Currency, UIMode, getUIModeString, HomeMember,
  ModelUtility, ConsoleLogTypeEnum } from '../../../model';
import { AuthService, HomeDefOdataService, FinanceOdataService, UIStatusService } from '../../../services';

@Component({
  selector: 'hih-home-def-detail',
  templateUrl: './home-def-detail.component.html',
  styleUrls: ['./home-def-detail.component.less'],
})
export class HomeDefDetailComponent implements OnInit, OnDestroy {
  // tslint:disable: variable-name
  private _destroyed$: ReplaySubject<boolean>;
  private routerID = -1; // Current object ID in routing

  public isLoadingResults: boolean;
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  public arCurrencies: Currency[] = [];
  public detailForm: FormGroup;
  public arMembers: HomeMember[] = [];

  get IsCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  constructor(
    public authService: AuthService,
    public finService: FinanceOdataService,
    public storageService: HomeDefOdataService,
    private activateRoute: ActivatedRoute,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeDefDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.detailForm = new FormGroup({
      idControl: new FormControl({value: -1, disable: true }),
      nameControl: new FormControl('', Validators.required),
      baseCurrControl: new FormControl('', Validators.required),
      hostControl: new FormControl({value: this.authService.authSubject.getValue().getUserId(), disable: true }, Validators.required),
      detailControl: new FormControl(''),
    });
    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeDefDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.finService.fetchAllCurrencies()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((curries: Currency[]) => {
      this.arCurrencies = curries;

      // Distinguish current mode
      this.activateRoute.url.subscribe((x: any) => {
        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'create') {
            this.uiMode = UIMode.Create;
          } else if (x[0].path === 'edit') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'display') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Display;
          }
          this.currentMode = getUIModeString(this.uiMode);

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this.isLoadingResults = true;

            this.storageService.readHomeDef(this.routerID)
              .pipe(takeUntil(this._destroyed$))
              .subscribe((dtl: HomeDef) => {

              this.isLoadingResults = false;
              this.detailForm.get('nameControl').setValue(dtl.Name);
              this.detailForm.get('baseCurrControl').setValue(dtl.BaseCurrency);
              this.detailForm.get('hostControl').setValue(dtl.Host);
              this.detailForm.get('detailControl').setValue(dtl.Details);
              this.detailForm.markAsUntouched();
              this.detailForm.markAsPristine();

              if (this.uiMode === UIMode.Display) {
                this.detailForm.disable();
              } else if (this.uiMode === UIMode.Change) {
                this.detailForm.enable();
              }

              this.arMembers = dtl.Members.slice();
            }, (error: any) => {
              this.isLoadingResults = false;

              // Show error dialog
              // popupDialog(this._dialog, this._uiService.getUILabel(UICommonLabelEnum.Error),
              //   error ? error.toString() : this._uiService.getUILabel(UICommonLabelEnum.Error));
            });
          }
        }
      });
    }, (error: any) => {
      // Show error dialog
      // popupDialog(this._dialog, this._uiService.getUILabel(UICommonLabelEnum.Error),
      //   error ? error.toString() : this._uiService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeDefDetailComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSave() {
    // Save the data
  }

  onCreateMember() {
  }
}
