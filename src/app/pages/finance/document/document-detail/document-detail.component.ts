import {
  Component,
  OnInit,
  ChangeDetectorRef,
  DestroyRef,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { UIMode, isUIEditable } from 'actslib';

import { FinanceOdataService, HomeDefOdataService } from '../../../../services';
import {
  Account,
  Document,
  ControlCenter,
  AccountCategory,
  TranType,
  DocumentType,
  Currency,
  Order,
  BuildupAccountForSelection,
  UIAccountForSelection,
  UIOrderForSelection,
  ModelUtility,
  ConsoleLogTypeEnum,
  getUIModeString,
  DocumentItem,
  BuildupOrderForSelectionEx,
} from '../../../../model';
import { UntypedFormGroup, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafeAny } from '@common/any';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzFormModule } from 'ng-zorro-antd/form';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'hih-fin-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    DocumentHeaderComponent,
    DocumentItemsComponent,
    NzInputModule,
    NzButtonModule,
    TranslocoModule,
    RouterModule,
    NzModalModule,
  ],
})
export class DocumentDetailComponent implements OnInit {
  private _modalCloseTimer?: ReturnType<typeof setTimeout>;
  private _modeSwitchTimer?: ReturnType<typeof setTimeout>;
  isLoadingResults = signal(false);
  public routerID = signal(-1); // Current object ID in routing
  public currentMode = signal('');
  public uiMode = signal<UIMode>(UIMode.Create);
  public currentDocument: Document;
  // Attributes
  baseCurrency: string;
  arControlCenters = signal<ControlCenter[]>([]);
  arAccountCategories = signal<AccountCategory[]>([]);
  arDocTypes = signal<DocumentType[]>([]);
  arTranType = signal<TranType[]>([]);
  arUIAccounts = signal<UIAccountForSelection[]>([]);
  arUIOrders = signal<UIOrderForSelection[]>([]);
  arCurrencies = signal<Currency[]>([]);
  // Form group
  docFormGroup: UntypedFormGroup;

  get isFieldChangable(): boolean {
    return isUIEditable(this.uiMode());
  }

  private readonly homeService = inject(HomeDefOdataService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly odataService = inject(FinanceOdataService);
  private readonly modalService = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly destroyedRef = inject(DestroyRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentDetailComponent constructor...',
      ConsoleLogTypeEnum.debug,
    );

    this.currentDocument = new Document();
    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';
    this.docFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ disabled: true }),
      headerControl: new UntypedFormControl(this.currentDocument, Validators.required),
      itemsControl: new UntypedFormControl(),
    });

    this.destroyedRef.onDestroy(() => {
      if (this._modalCloseTimer) {
        clearTimeout(this._modalCloseTimer);
      }
      if (this._modeSwitchTimer) {
        clearTimeout(this._modeSwitchTimer);
      }
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug,
    );
    this.cd.detectChanges();

    this.activateRoute.url.pipe(takeUntilDestroyed(this.destroyedRef)).subscribe((x) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit, activateRoute: ${x}`,
        ConsoleLogTypeEnum.debug,
      );

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.uiMode.set(UIMode.Create);
        } else if (x[0].path === 'edit') {
          this.routerID.set(+x[1].path);

          this.uiMode.set(UIMode.Update);
        } else if (x[0].path === 'display') {
          this.routerID.set(+x[1].path);

          this.uiMode.set(UIMode.Display);
        }

        this.currentMode.set(getUIModeString(this.uiMode()));
      }

      switch (this.uiMode()) {
        case UIMode.Update:
        case UIMode.Display: {
          this.isLoadingResults.set(true);

          // Read the document
          forkJoin([
            this.odataService.fetchAllCurrencies(),
            this.odataService.fetchAllDocTypes(),
            this.odataService.fetchAllTranTypes(),
            this.odataService.fetchAllAccountCategories(),
            this.odataService.fetchAllAccounts(),
            this.odataService.fetchAllControlCenters(),
            this.odataService.fetchAllOrders(),
            this.odataService.readDocument(this.routerID()),
          ])
            .pipe(
              takeUntilDestroyed(this.destroyedRef),
              finalize(() => {
                this.isLoadingResults.set(false);
              }),
            )
            .subscribe({
              next: (rsts) => {
                this.arCurrencies.set(rsts[0] as Currency[]);
                this.arDocTypes.set(rsts[1] as DocumentType[]);
                this.arTranType.set(rsts[2] as TranType[]);
                this.arAccountCategories.set(rsts[3] as AccountCategory[]);
                this.arUIAccounts.set(BuildupAccountForSelection(rsts[4] as Account[], rsts[3] as AccountCategory[]));
                this.arControlCenters.set(rsts[5] as ControlCenter[]);
                this.currentDocument = rsts[7] as Document;
                const arorders = rsts[6] as Order[];
                this.arUIOrders.set(BuildupOrderForSelectionEx(arorders, this.currentDocument.TranDate));

                // Check the accounts in use
                const listAcntIDs = this.currentDocument.Items.map((item) => {
                  return item.AccountId;
                });
                const listNIDs: number[] = [];
                listAcntIDs.forEach((acntid) => {
                  if (this.arUIAccounts().findIndex((acnt) => acnt.Id === acntid) === -1) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    listNIDs.push(acntid!);
                  }
                });

                if (listNIDs.length > 0) {
                  const listRst: SafeAny = [];
                  listNIDs.forEach((nid) => {
                    listRst.push(this.odataService.readAccount(nid));
                  });

                  // Read the account
                  forkJoin(listRst)
                    .pipe(
                      takeUntilDestroyed(this.destroyedRef),
                      finalize(() => {
                        this.onSetData();
                      }),
                    )
                    .subscribe({
                      next: () => {
                        this.arUIAccounts.set([]);
                        this.arUIAccounts.set(
                          BuildupAccountForSelection(this.odataService.Accounts, this.odataService.AccountCategories),
                        );
                      },
                      error: (err) => {
                        this.uiMode.set(UIMode.Invalid);
                        this.modalService.create({
                          nzTitle: translate('Common.Error'),
                          nzContent: err.toString(),
                          nzClosable: true,
                        });
                      },
                    });
                } else {
                  this.onSetData();
                }
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Failed in DocumentDetailComponent ngOninit, forkJoin : ${err}`,
                  ConsoleLogTypeEnum.error,
                );

                this.uiMode.set(UIMode.Invalid);
                this.modalService.create({
                  nzTitle: translate('Common.Error'),
                  nzContent: err.toString(),
                  nzClosable: true,
                });
              },
            });
          break;
        }

        case UIMode.Create:
        default:
          break;
      }
    });
  }

  private onSetData() {
    this.docFormGroup.get('idControl')?.setValue(this.currentDocument.Id);
    this.docFormGroup.get('headerControl')?.setValue(this.currentDocument);
    this.docFormGroup.get('itemsControl')?.setValue(this.currentDocument.Items);

    if (this.uiMode() === UIMode.Display) {
      this.docFormGroup.disable();
    } else {
      this.odataService
        .isDocumentChangable(this.routerID())
        .pipe(takeUntilDestroyed(this.destroyedRef))
        .subscribe({
          next: (val) => {
            if (val) {
              this.docFormGroup.enable();
              this.docFormGroup.get('idControl')?.disable();
            } else {
              const ref: NzModalRef = this.modalService.info({
                nzTitle: translate('Common.Error'),
                nzContent: translate('Finance.EditDocumentNotAllowed'),
                nzClosable: false,
              });
              this._modalCloseTimer = setTimeout(() => {
                ref.close();
                ref.destroy();
              }, 1000);

              this._modeSwitchTimer = setTimeout(() => {
                this.uiMode.set(UIMode.Display);
                this.docFormGroup.disable();
              });
            }
          },
          error: (err) => {
            this.uiMode.set(UIMode.Display);
            this.docFormGroup.disable();
            this.modalService.create({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentDetailComponent onSave...',
      ConsoleLogTypeEnum.debug,
    );
    if (this.uiMode() === UIMode.Update) {
      // Update mode.
      const detailObject = this.docFormGroup.get('headerControl')?.value as Document;
      detailObject.HID = this.currentDocument.HID;
      detailObject.Id = this.currentDocument.Id;
      detailObject.DocType = this.currentDocument.DocType;
      detailObject.Items = this.docFormGroup.get('itemsControl')?.value as DocumentItem[];
      detailObject.Items.forEach((item) => {
        item.DocId = detailObject.Id;
      });

      this.odataService
        .changeDocument(detailObject)
        .pipe(takeUntilDestroyed(this.destroyedRef))
        .subscribe({
          next: (val) => {
            const ref: NzModalRef = this.modalService.success({
              nzTitle: translate('Common.Success'),
              nzContent: translate('Finance.EditDocumentSuccessfully'),
            });
            this._modalCloseTimer = setTimeout(() => {
              ref.close();
              ref.destroy();
            }, 1000);

            this.router.navigate(['/finance/document/display', val.Id]);
          },
          error: (err) => {
            console.error(err);
            this.modalService.create({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    }
  }

  onChangeToEditMode(): void {
    if (this.routerID()) {
      this.odataService
        .isDocumentChangable(this.routerID())
        .pipe(takeUntilDestroyed(this.destroyedRef))
        .subscribe({
          next: (val) => {
            if (val) {
              this.router.navigate(['/finance/document/edit/', this.routerID()]);
            } else {
              const ref: NzModalRef = this.modalService.info({
                nzTitle: translate('Common.Error'),
                nzContent: translate('Finance.EditDocumentNotAllowed'),
                nzClosable: false,
              });
              this._modalCloseTimer = setTimeout(() => {
                ref.close();
                ref.destroy();
              }, 1000);

              this._modeSwitchTimer = setTimeout(() => {
                this.uiMode.set(UIMode.Display);
                this.docFormGroup.disable();
              });
            }
          },
          error: (err) => {
            this.uiMode.set(UIMode.Display);
            this.docFormGroup.disable();
            this.modalService.create({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    }
  }
}
