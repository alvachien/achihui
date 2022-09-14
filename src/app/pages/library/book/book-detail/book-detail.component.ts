import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { translate } from '@ngneat/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UIMode, isUIEditable } from 'actslib';

import { LogLevel, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil,
  Book, momentDateFormat, getUIModeString, Person, Organization, BookCategory, Location, } from '../../../../model';
import { LibraryStorageService, UIStatusService, } from '../../../../services';

@Component({
  selector: 'hih-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.less'],
})
export class BookDetailComponent implements OnInit, OnDestroy {

  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean = false;
  public routerID = -1; // Current object ID in routing
  public currentMode: string = '';
  public uiMode: UIMode = UIMode.Create;
  detailFormGroup: FormGroup;
  listAuthors: Person[] = [];
  listTranslators: Person[] = [];
  listPresses: Organization[] = [];
  listCategories: BookCategory[] = [];
  listLocations: Location[] = [];

  constructor(private storageService: LibraryStorageService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.detailFormGroup = new FormGroup({
      idControl: new FormControl({value: undefined, disabled: true}),
      nnameControl: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe((x: any) => {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering BookDetailComponent ngOnInit activateRoute: ${x}`,
        ConsoleLogTypeEnum.debug);

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
          this.storageService.readBook(this.routerID)
          .pipe(
            takeUntil(this._destroyed$!),
            finalize(() => this.isLoadingResults = false)
            )
          .subscribe({
            next: (e: Book) => {
              this.detailFormGroup.get('idControl')?.setValue(e.ID);
              this.detailFormGroup.get('nnameControl')?.setValue(e.NativeName);
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
            error: err => {
              ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering BookDetailComponent ngOnInit readBook failed ${err}...`,
                ConsoleLogTypeEnum.error);
              this.modalService.error({
                nzTitle: translate('Common.Error'),
                nzContent: err,
                nzClosable: true,
              });
            }
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
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent OnDestroy...',
      ConsoleLogTypeEnum.debug);

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering BookDetailComponent onSave...',
      ConsoleLogTypeEnum.debug);

    // const objColl = new BlogCollection();
    // objColl.name = this.detailFormGroup.get('nameControl')?.value;
    // objColl.comment = this.detailFormGroup.get('commentControl')?.value;

    // if (this.uiMode === UIMode.Create) {
    //   this.odataService.createCollection(objColl)
    //   .pipe(takeUntil(this._destroyed$!))
    //   .subscribe({
    //     next: e => {
    //       // Succeed.
    //       this.router.navigate(['/blog/collection/display/' + e.id.toString()]);
    //     },
    //     error: err => {
    //       ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering CollectionDetailComponent ngOnInit readCollection failed ${err}...`,
    //         ConsoleLogTypeEnum.error);
    //       this.modalService.error({
    //         nzTitle: translate('Common.Error'),
    //         nzContent: err,
    //         nzClosable: true,
    //       });
    //     }
    //   });
    // }
  }
}
