import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin, ReplaySubject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import { translate } from "@ngneat/transloco";
import { NzModalService } from "ng-zorro-antd/modal";
import { UIMode, isUIEditable } from "actslib";

import {
  ModelUtility,
  ConsoleLogTypeEnum,
  getUIModeString,
  Organization,
  OrganizationType,
} from "../../../../model";
import { HomeDefOdataService, LibraryStorageService } from "src/app/services";

@Component({
  selector: "hih-organization-detail",
  templateUrl: "./organization-detail.component.html",
  styleUrls: ["./organization-detail.component.less"],
})
export class OrganizationDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  public routerID = -1; // Current object ID in routing
  public currentMode = "";
  public uiMode: UIMode = UIMode.Create;
  detailFormGroup: UntypedFormGroup;
  listTypes: OrganizationType[] = [];
  allTypes: OrganizationType[] = [];

  constructor(
    private storageService: LibraryStorageService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private homeService: HomeDefOdataService,
    private modalService: NzModalService
  ) {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering OrganizationDetailComponent constructor...",
      ConsoleLogTypeEnum.debug
    );

    this.detailFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ value: undefined, disabled: true }),
      nnameControl: new UntypedFormControl("", [
        Validators.required,
        Validators.maxLength(100),
      ]),
      cnameControl: new UntypedFormControl("", [Validators.maxLength(100)]),
      chnIsNativeControl: new UntypedFormControl(false),
    });
  }

  get isEditable(): boolean {
    return isUIEditable(this.uiMode);
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering OrganizationDetailComponent ngOnInit...",
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe((x: any) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering OrganizationDetailComponent ngOnInit activateRoute: ${x}`,
        ConsoleLogTypeEnum.debug
      );

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === "create") {
          this.uiMode = UIMode.Create;
        } else if (x[0].path === "edit") {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Update;
        } else if (x[0].path === "display") {
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
            this.storageService.fetchAllOrganizationTypes(),
            this.storageService.readOrganization(this.routerID),
          ])
            .pipe(
              takeUntil(this._destroyed$!),
              finalize(() => (this.isLoadingResults = false))
            )
            .subscribe({
              next: (e: any) => {
                this.allTypes = e[0];

                this.detailFormGroup.get("idControl")?.setValue(e[1].ID);
                this.detailFormGroup
                  .get("nnameControl")
                  ?.setValue(e[1].NativeName);
                this.detailFormGroup
                  .get("cnameControl")
                  ?.setValue(e[1].ChineseName);
                this.detailFormGroup
                  .get("chnIsNativeControl")
                  ?.setValue(e[1].ChineseIsNative);
                this.listTypes = e[1].Types.slice();

                if (this.uiMode === UIMode.Display) {
                  this.detailFormGroup.disable();
                } else if (this.uiMode === UIMode.Update) {
                  this.detailFormGroup.enable();
                  this.detailFormGroup.get("idControl")?.disable();
                }
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering OrganizationDetailComponent ngOnInit readOrganization failed ${err}...`,
                  ConsoleLogTypeEnum.error
                );
                this.modalService.error({
                  nzTitle: translate("Common.Error"),
                  nzContent: err.toString(),
                  nzClosable: true,
                });
              },
            });
          break;
        }

        case UIMode.Create:
        default: {
          this.storageService
            .fetchAllOrganizationTypes()
            .pipe(
              takeUntil(this._destroyed$!),
              finalize(() => (this.isLoadingResults = false))
            )
            .subscribe({
              next: (rtndata) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Debug]: Entering OrganizationDetailComponent onInit fetchAllOrganizationTypes.`,
                  ConsoleLogTypeEnum.debug
                );
                this.allTypes = rtndata;
                this.detailFormGroup.get("idControl")?.setValue("NEW OBJECT");
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering OrganizationDetailComponent onInit fetchAllOrganizationTypes ${err}...`,
                  ConsoleLogTypeEnum.error
                );
                this.modalService.error({
                  nzTitle: translate("Common.Error"),
                  nzContent: err.toString(),
                  nzClosable: true,
                });
              },
            });
        }
      }
    });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering OrganizationDetailComponent OnDestroy...",
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onAssignType(): void {
    this.listTypes = [...this.listTypes, new OrganizationType()];
  }
  onRemoveTypeAssignment(tid: number): void {
    const ntypeidx = this.listTypes.findIndex((p) => p.ID === tid);
    if (ntypeidx !== -1) {
      this.listTypes.splice(ntypeidx, 1);
      this.listTypes = [...this.listTypes];
    }
  }
  onTypeModeChanged(tid: any) {
    const tidx = this.allTypes.findIndex((p) => p.ID === +tid);
    if (tidx !== -1) {
    } else {
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog(
      "AC_HIH_UI [Debug]: Entering OrganizationDetailComponent onSave...",
      ConsoleLogTypeEnum.debug
    );

    const objtbo = new Organization();
    objtbo.ChineseIsNative =
      this.detailFormGroup.get("chnIsNativeControl")?.value;
    objtbo.ChineseName = this.detailFormGroup.get("cnameControl")?.value;
    objtbo.NativeName = this.detailFormGroup.get("nnameControl")?.value;
    objtbo.Types = this.listTypes.slice();
    objtbo.HID = this.homeService.ChosedHome?.ID!;

    if (this.uiMode === UIMode.Create) {
      this.storageService
        .createOrganization(objtbo)
        .pipe(takeUntil(this._destroyed$!))
        .subscribe({
          next: (e) => {
            // Succeed.
            this.router.navigate([
              "/library/organization/display/" + e.ID.toString(),
            ]);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering OrganizationDetailComponent ngOnInit createOrganization failed ${err}...`,
              ConsoleLogTypeEnum.error
            );
            this.modalService.error({
              nzTitle: translate("Common.Error"),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    } else if (this.uiMode === UIMode.Update) {
      objtbo.ID = this.detailFormGroup.get("idControl")?.value;
    }
  }
}
