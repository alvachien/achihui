import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { translate } from '@ngneat/transloco';

import { HomeDef, Currency, UIMode, getUIModeString, HomeMember,
  ModelUtility, ConsoleLogTypeEnum, UIDisplayString, UIDisplayStringUtil, HomeMemberRelationEnum } from '../../../model';
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
  public detailFormGroup: FormGroup;
  public listMembers: HomeMember[] = [];
  public listMemRel: UIDisplayString[] = [];

  get IsCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isSaveAllowed(): boolean {
    if (this.isFieldChangable) {
      return this.detailFormGroup.valid && this.isItemsValid;
    }
    return false;
  }
  get isItemsValid(): boolean {
    if (this.listMembers.length > 0) {
      let bvalid = true;
      let selfitem = 0;
      this.listMembers.forEach((val: HomeMember) => {
        if (!val.isValid) {
          bvalid = false;
        }
        if (val.Relation === HomeMemberRelationEnum.Self) {
          ++selfitem;
        }
      });
      if (selfitem !== 1) {
        bvalid = false;
      }

      return bvalid;
    }
    return false;
  }

  constructor(
    public authService: AuthService,
    public finService: FinanceOdataService,
    public storageService: HomeDefOdataService,
    private activateRoute: ActivatedRoute,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeDefDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.listMemRel = UIDisplayStringUtil.getHomeMemberRelationEnumStrings();

    this.detailFormGroup = new FormGroup({
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
      }

      switch(this.uiMode) {
        case UIMode.Change:
        case UIMode.Display: {
          this.isLoadingResults = true;
          forkJoin([
            this.finService.fetchAllCurrencies(),
            this.storageService.readHomeDef(this.routerID)
          ]).subscribe((rsts: any[]) => {
            this.arCurrencies = rsts[0];

            this.detailFormGroup.get('nameControl').setValue(rsts[1].Name);
            this.detailFormGroup.get('baseCurrControl').setValue(rsts[1].BaseCurrency);
            this.detailFormGroup.get('hostControl').setValue(rsts[1].Host);
            this.detailFormGroup.get('detailControl').setValue(rsts[1].Details);
            this.detailFormGroup.markAsUntouched();
            this.detailFormGroup.markAsPristine();

            if (this.uiMode === UIMode.Display) {
              this.detailFormGroup.disable();
            } else if (this.uiMode === UIMode.Change) {
              this.detailFormGroup.enable();
            }

            this.listMembers = rsts[1].Members.slice();
          }, (error: any) => {
            // Show error dialog
            this.modalService.create({
              nzTitle: translate('Common.Error'),
              nzContent: error,
              nzClosable: true,
            });
          }, () => {
            this.isLoadingResults = false;
          });
        }
        break;

        case UIMode.Create:
        default: {
          this.isLoadingResults = true;
          this.finService.fetchAllCurrencies()
            .pipe(takeUntil(this._destroyed$))
            .subscribe((curries: Currency[]) => {
              this.arCurrencies = curries;
            }, (error: any) => {
              // Show error dialog
              this.modalService.create({
                nzTitle: translate('Common.Error'),
                nzContent: error,
                nzClosable: true,
              });
            }, () => {
              this.isLoadingResults = false;
            });  
        }
        break;
      }
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

  onChange() {    
  }

  onSave() {
    // Save the data
  }

  onCreateMember() {
  }
}
