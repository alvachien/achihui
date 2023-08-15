import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { UIMode, isUIEditable } from 'actslib';

import {
  ModelUtility,
  ConsoleLogTypeEnum,
  Book,
  getUIModeString,
  Person,
  Organization,
  BookCategory,
  Location,
} from '../../../../model';
import { HomeDefOdataService, LibraryStorageService } from '../../../../services';
import { PersonSelectionDlgComponent } from '../../person/person-selection-dlg';
import { OrganizationSelectionDlgComponent } from '../../organization/organization-selection-dlg';
import { BookCategorySelectionDlgComponent } from '../../config/book-category-selection-dlg';
import { LocationSelectionDlgComponent } from '../../location/location-selection-dlg';

@Component({
  selector: 'hih-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.less'],
})
export class BookDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  public routerID = -1; // Current object ID in routing
  public currentMode = '';
  public uiMode: UIMode = UIMode.Create;
  detailFormGroup: UntypedFormGroup;
  listAuthors: Person[] = [];
  listTranslators: Person[] = [];
  listPresses: Organization[] = [];
  listCategories: BookCategory[] = [];
  listLocations: Location[] = [];

  constructor(
    private storageService: LibraryStorageService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private homeService: HomeDefOdataService
  ) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookDetailComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.detailFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({ value: undefined, disabled: true }),
      nnameControl: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
      cnameControl: new UntypedFormControl('', [Validators.maxLength(100)]),
      chnIsNativeControl: new UntypedFormControl(false),
    });
  }

  get isEditable(): boolean {
    return isUIEditable(this.uiMode);
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe((x) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering BookDetailComponent ngOnInit activateRoute: ${x}`,
        ConsoleLogTypeEnum.debug
      );

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
          this.storageService
            .readBook(this.routerID)
            .pipe(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              takeUntil(this._destroyed$!),
              finalize(() => (this.isLoadingResults = false))
            )
            .subscribe({
              next: (e: Book) => {
                this.detailFormGroup.get('idControl')?.setValue(e.ID);
                this.detailFormGroup.get('nnameControl')?.setValue(e.NativeName);
                this.detailFormGroup.get('cnameControl')?.setValue(e.ChineseName);
                this.detailFormGroup.get('chnIsNativeControl')?.setValue(e.ChineseIsNative);
                this.listAuthors = e.Authors;
                this.listCategories = e.Categories;
                this.listLocations = e.Locations;
                this.listPresses = e.Presses;
                this.listTranslators = e.Translators;

                if (this.uiMode === UIMode.Display) {
                  this.detailFormGroup.disable();
                } else if (this.uiMode === UIMode.Update) {
                  this.detailFormGroup.enable();
                  this.detailFormGroup.get('idControl')?.disable();
                }
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Entering BookDetailComponent ngOnInit readBook failed ${err}...`,
                  ConsoleLogTypeEnum.error
                );
                this.modal.error({
                  nzTitle: translate('Common.Error'),
                  nzContent: err.toString(),
                  nzClosable: true,
                });
              },
            });
          break;
        }

        case UIMode.Create:
        default: {
          // Do nothing
          this.detailFormGroup.get('idControl')?.setValue('NEW OBJECT');
          break;
        }
      }
    });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering BookDetailComponent OnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onAssignAuthor(): void {
    const setPerson: Set<number> = new Set<number>();
    this.listAuthors.forEach((prn) => {
      setPerson.add(prn.ID);
    });
    const modal: NzModalRef = this.modal.create({
      nzTitle: translate('Library.SelectAuthor'),
      nzWidth: 900,
      nzContent: PersonSelectionDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        setOfCheckedId: setPerson,
      },
      nzOnOk: () => {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignAuthor, OK button...',
          ConsoleLogTypeEnum.debug
        );
        this.listAuthors = [];
        setPerson.forEach((pid) => {
          this.storageService.Persons.forEach((person) => {
            if (person.ID === pid) {
              this.listAuthors.push(person);
            }
          });
        });
      },
      nzOnCancel: () => {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignAuthor, cancelled...',
          ConsoleLogTypeEnum.debug
        );
      },
    });
    //const instance = modal.getContentComponent();
    // Return a result when closed
    modal.afterClose.subscribe(() => {
      // Donothing by now.
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignAuthor, dialog closed...',
        ConsoleLogTypeEnum.debug
      );
    });
  }
  onAssignTranslator() {
    // TBD.
  }
  onAssignPress(): void {
    const setPress: Set<number> = new Set<number>();
    this.listPresses.forEach((prs) => {
      setPress.add(prs.ID);
    });
    const modal: NzModalRef = this.modal.create({
      nzTitle: translate('Library.SelectPress'),
      nzWidth: 900,
      nzContent: OrganizationSelectionDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        setOfCheckedId: setPress,
      },
      nzOnOk: () => {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignPress, OK button...',
          ConsoleLogTypeEnum.debug
        );
        this.listPresses = [];
        setPress.forEach((pid) => {
          this.storageService.Organizations.forEach((org) => {
            if (org.ID === pid) {
              this.listPresses.push(org);
            }
          });
        });
      },
      nzOnCancel: () => {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignPress, cancelled...',
          ConsoleLogTypeEnum.debug
        );
      },
    });
    //const instance = modal.getContentComponent();
    // Return a result when closed
    modal.afterClose.subscribe(() => {
      // Donothing by now.
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignPress, dialog closed...',
        ConsoleLogTypeEnum.debug
      );
    });
  }
  onAssignCategory(): void {
    const setCategory: Set<number> = new Set<number>();
    this.listCategories.forEach((ctg) => {
      setCategory.add(ctg.ID);
    });
    const modal: NzModalRef = this.modal.create({
      nzTitle: translate('Library.SelectCategory'),
      nzWidth: 900,
      nzContent: BookCategorySelectionDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        setOfCheckedId: setCategory,
      },
      nzOnOk: () => {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignCategory, OK button...',
          ConsoleLogTypeEnum.debug
        );
        this.listCategories = [];
        setCategory.forEach((pid) => {
          this.storageService.BookCategories.forEach((ctgy) => {
            if (ctgy.ID === pid) {
              this.listCategories.push(ctgy);
            }
          });
        });
      },
      nzOnCancel: () => {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignCategory, cancelled...',
          ConsoleLogTypeEnum.debug
        );
      },
    });
    //const instance = modal.getContentComponent();
    // Return a result when closed
    modal.afterClose.subscribe(() => {
      // Donothing by now.
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignCategory, dialog closed...',
        ConsoleLogTypeEnum.debug
      );
    });
  }
  onAssignLocation(): void {
    const setLocation: Set<number> = new Set<number>();
    this.listLocations.forEach((loc) => {
      setLocation.add(loc.ID);
    });
    const modal: NzModalRef = this.modal.create({
      nzTitle: translate('Library.SelectLocation'),
      nzWidth: 900,
      nzContent: LocationSelectionDlgComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        setOfCheckedId: setLocation,
      },
      nzOnOk: () => {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignLocation, OK button...',
          ConsoleLogTypeEnum.debug
        );
        this.listLocations = [];
        setLocation.forEach((pid) => {
          this.storageService.Locations.forEach((loc) => {
            if (loc.ID === pid) {
              this.listLocations.push(loc);
            }
          });
        });
      },
      nzOnCancel: () => {
        ModelUtility.writeConsoleLog(
          'AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignLocation, cancelled...',
          ConsoleLogTypeEnum.debug
        );
      },
    });
    //const instance = modal.getContentComponent();
    // Return a result when closed
    modal.afterClose.subscribe(() => {
      // Do nothing by now.
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering BookDetailComponent onAssignLocation, dialog closed...',
        ConsoleLogTypeEnum.debug
      );
    });
  }

  onSave(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent onSave...', ConsoleLogTypeEnum.debug);

    const objtbo = new Book();
    objtbo.ChineseName = this.detailFormGroup.get('cnameControl')?.value;
    objtbo.NativeName = this.detailFormGroup.get('nnameControl')?.value;
    objtbo.ChineseIsNative = this.detailFormGroup.get('chnIsNativeControl')?.value;
    objtbo.HID = this.homeService.ChosedHome?.ID ?? 0;
    objtbo.Authors = this.listAuthors.slice();
    objtbo.Translators = this.listTranslators.slice();
    objtbo.Categories = this.listCategories.slice();
    objtbo.Locations = this.listLocations.slice();
    objtbo.Presses = this.listPresses.slice();

    if (this.uiMode === UIMode.Create) {
      this.storageService
        .createBook(objtbo)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .pipe(takeUntil(this._destroyed$!))
        .subscribe({
          next: (e) => {
            // Succeed.
            this.router.navigate(['/library/book/display/' + e.ID.toString()]);
          },
          error: (err) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering BookDetailComponent onSave failed ${err}...`,
              ConsoleLogTypeEnum.error
            );
            this.modal.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    } else if (this.uiMode === UIMode.Update) {
      // Do nothing for now.
    }
  }
}
