import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { translate } from '@ngneat/transloco';
import { UIMode, isUIEditable } from 'actslib';

import { HomeDef, Currency, getUIModeString, HomeMember,
  ModelUtility, ConsoleLogTypeEnum, UIDisplayString, UIDisplayStringUtil, HomeMemberRelationEnum } from '../../../model';
import { AuthService, HomeDefOdataService, FinanceOdataService, UIStatusService } from '../../../services';

@Component({
  selector: 'hih-home-def-detail',
  templateUrl: './home-def-detail.component.html',
  styleUrls: ['./home-def-detail.component.less'],
})
export class HomeDefDetailComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
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
    return isUIEditable(this.uiMode);
  }
  get isSaveAllowed(): boolean {
    if (this.isFieldChangable) {
      return this.detailFormGroup.valid && this.isItemsValid;
    }
    return false;
  }
  get isDeleteItemAllowed(): boolean {
    if (this.isFieldChangable) {
      return true;
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
  get currentHomeDefObject(): HomeDef {
    const hdobj = new HomeDef();
    hdobj.Name = this.detailFormGroup.get('nameControl').value;
    hdobj.BaseCurrency = this.detailFormGroup.get('baseCurrControl').value;
    this.listMembers.forEach(val => {
      hdobj.Members.push(val);
    });

    return hdobj;
  }

  constructor(
    public authService: AuthService,
    public finService: FinanceOdataService,
    public storageService: HomeDefOdataService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private modalService: NzModalService) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeDefDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.listMemRel = UIDisplayStringUtil.getHomeMemberRelationEnumStrings();

    this.detailFormGroup = new FormGroup({
      idControl: new FormControl({value: undefined, disabled: true }),
      nameControl: new FormControl('', Validators.required),
      detailControl: new FormControl(),
      baseCurrControl: new FormControl('', Validators.required),
      hostControl: new FormControl({value: this.authService.authSubject.getValue().getUserId(), disabled: true }, Validators.required),
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

          this.uiMode = UIMode.Update;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }
        this.currentMode = getUIModeString(this.uiMode);
      }

      switch (this.uiMode) {
        case UIMode.Update:
        case UIMode.Display: {
          this.isLoadingResults = true;
          forkJoin([
            this.finService.fetchAllCurrencies(),
            this.storageService.readHomeDef(this.routerID)
          ])
          .pipe(takeUntil(this._destroyed$),
            finalize(() => this.isLoadingResults = false))
          .subscribe({
            next: (rsts: any[]) => {
            this.arCurrencies = rsts[0];

            this.detailFormGroup.get('idControl').setValue(rsts[1].ID);
            this.detailFormGroup.get('nameControl').setValue(rsts[1].Name);
            this.detailFormGroup.get('baseCurrControl').setValue(rsts[1].BaseCurrency);
            this.detailFormGroup.get('hostControl').setValue(rsts[1].Host);
            this.detailFormGroup.get('detailControl').setValue(rsts[1].Details);
            this.detailFormGroup.markAsUntouched();
            this.detailFormGroup.markAsPristine();

            if (this.uiMode === UIMode.Display) {
              this.detailFormGroup.disable();
            } else if (this.uiMode === UIMode.Update) {
              this.detailFormGroup.enable();
              this.detailFormGroup.get('idControl').disable();
            }

            this.listMembers = rsts[1].Members.slice();
          },
          error: (error: any) => {
            // Show error dialog
            this.modalService.create({
              nzTitle: translate('Common.Error'),
              nzContent: error,
              nzClosable: true,
            });
          }
          });
          break;
        }

        case UIMode.Create:
        default: {
          this.isLoadingResults = true;
          this.finService.fetchAllCurrencies()
            .pipe(takeUntil(this._destroyed$),
            finalize(() => this.isLoadingResults = false))
            .subscribe({
              next: (curries: Currency[]) => {
                this.arCurrencies = curries;

                // Insert one home member by default
                this.listMembers = [];
                const nm = new HomeMember();
                nm.User = this.authService.authSubject.getValue().getUserId();
                nm.Relation = HomeMemberRelationEnum.Self;
                nm.DisplayAs = nm.User;
                this.listMembers.push(nm);
              },
              error: (error: any) => {
                // Show error dialog
                this.modalService.create({
                  nzTitle: translate('Common.Error'),
                  nzContent: error,
                  nzClosable: true,
                });
              }
            });
          break;
        }
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering HomeDefDetailComponent onChange...',
      ConsoleLogTypeEnum.debug);
  }

  onSave() {
    // Save the data
    if (this.uiMode === UIMode.Create) {
      // Create mode
      const hdobj = new HomeDef();
      hdobj.Name = this.detailFormGroup.get('nameControl').value;
      hdobj.BaseCurrency = this.detailFormGroup.get('baseCurrControl').value;
      hdobj.Host = this.detailFormGroup.get('hostControl').value;
      hdobj.Details = this.detailFormGroup.get('detailControl').value;

      this.listMembers.forEach(val => hdobj.Members.push(val));
      if (!hdobj.isValid) {
        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: 'Errors',
          nzClosable: true,
        });

        return;
      }

      this.storageService.createHomeDef(hdobj)
        .pipe(takeUntil(this._destroyed$))
        .subscribe({
        next: val => {
          // Shall create successfully.
          this.router.navigate(['/homedef/display/' + val.ID.toString()]);
        },
        error: err => {
          // Show error
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true,
          });
        }
      });
    } else if (this.uiMode === UIMode.Update) {
      // Change mode
      const hdobj = new HomeDef();
      hdobj.ID = +this.routerID;
      hdobj.Name = this.detailFormGroup.get('nameControl').value;
      hdobj.BaseCurrency = this.detailFormGroup.get('baseCurrControl').value;
      hdobj.Host = this.detailFormGroup.get('hostControl').value;
      hdobj.Details = this.detailFormGroup.get('detailControl').value;

      this.listMembers.forEach(val => hdobj.Members.push(val));
      if (!hdobj.isValid) {
        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: 'Errors',
          nzClosable: true,
        });

        return;
      }

      this.storageService.changeHomeDef(hdobj)
        .pipe(takeUntil(this._destroyed$))
        .subscribe({
        next: val => {
          // Shall create successfully.
          this.router.navigate(['/homedef/display/' + val.ID.toString()]);
        },
        error: err => {
          // Show error
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err,
            nzClosable: true,
          });
        }
      });
    }
  }

  onCreateMember() {
    const nmem = new HomeMember();
    const memes = this.listMembers.slice();
    if (this.routerID) {
      nmem.HomeID = +this.routerID;
    }
    memes.push(nmem);
    this.listMembers = memes;
  }
  onDeleteMember(idx: number) {
    const memes = this.listMembers.splice(idx, 1);
    this.listMembers = memes;
  }
}
