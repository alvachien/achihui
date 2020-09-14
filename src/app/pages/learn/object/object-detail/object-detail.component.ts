import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Account, UIMode, getUIModeString,
  UICommonLabelEnum, ModelUtility, UIDisplayString, UIDisplayStringUtil,
  ConsoleLogTypeEnum, HomeMember, LearnCategory, LearnObject,
} from '../../../../model';
import { HomeDefOdataService, FinanceOdataService, UIStatusService, LearnOdataService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'hih-object-detail',
  templateUrl: './object-detail.component.html',
  styleUrls: ['./object-detail.component.less'],
})
export class ObjectDetailComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  public routerID = -1; // Current object ID in routing
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  // Category
  listOfCategories: LearnCategory[] = [];
  currentObject: LearnObject;
  // Form group
  detailFormGroup: FormGroup;

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get isSaveAllowed(): boolean {
    if (this.isFieldChangable) {
      return this.detailFormGroup.valid;
    }
    return false;
  }

  constructor(
    private odataService: LearnOdataService,
    private activateRoute: ActivatedRoute,
    private homeSevice: HomeDefOdataService,
    private uiStatusService: UIStatusService,
    private modalService: NzModalService,
    private router: Router) {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering ObjectDetailComponent constructor`,
      ConsoleLogTypeEnum.debug);

    // Form group
    this.detailFormGroup = new FormGroup({
      idControl: new FormControl({value: undefined, disabled: true}),
      categoryControl: new FormControl(undefined, [Validators.required]),
      nameControl: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      contentControl: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
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

      switch (this.uiMode) {
        case UIMode.Change:
        case UIMode.Display: {
          this.isLoadingResults = true;

          forkJoin([
            this.odataService.fetchAllCategories(),
            this.odataService.readObject(this.routerID),
          ]).pipe(
            takeUntil(this._destroyed$),
            finalize(() => this.isLoadingResults = false),
          ).subscribe({
              next: val => {
                this.listOfCategories = val[0] as LearnCategory[];
                this.currentObject = val[1] as LearnObject;
                this.detailFormGroup.get('idControl').setValue(this.currentObject.Id);
                this.detailFormGroup.get('nameControl').setValue(this.currentObject.Name);
                this.detailFormGroup.get('categoryControl').setValue(this.currentObject.CategoryId);
                this.detailFormGroup.get('contentControl').setValue(this.currentObject.Content);
                this.detailFormGroup.get('idControl').disable();

                if (this.uiMode === UIMode.Display) {
                  this.detailFormGroup.disable();
                } else {
                  this.detailFormGroup.enable();
                }
              },
              error: err => {
                // Show error dialog
              }
            });
          break;
        }

        case UIMode.Create: {
          this.isLoadingResults = true;
          this.odataService.fetchAllCategories()
            .pipe(
              takeUntil(this._destroyed$),
              finalize(() => this.isLoadingResults = false),
            ).subscribe({
              next: val => {
                this.listOfCategories = val as LearnCategory[];
              },
              error: err => {
                // Show error dialog
              }
            });
          this.detailFormGroup.get('idControl').disable();
          this.currentObject = new LearnObject();
          break;
        }

        default:
          break;
      }
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering ObjectDetailComponent ngOnDestroy`,
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSave() {
    if (this.uiMode === UIMode.Create) {
      this.currentObject.HID = this.homeSevice.ChosedHome.ID;
      this.currentObject.Name = this.detailFormGroup.get('nameControl').value;
      this.currentObject.CategoryId = this.detailFormGroup.get('categoryControl').value;
      this.currentObject.Content = this.detailFormGroup.get('contentControl').value;

      this.odataService.createObject(this.currentObject)
        .pipe(takeUntil(this._destroyed$))
        .subscribe({
          next: val => {
            this.router.navigate(['/learn/object/display', val.Id.toString]);
          },
          error: err => {
            // TBD.
          }
        });
    } else if (this.uiMode === UIMode.Change) {
    }
  }
}
