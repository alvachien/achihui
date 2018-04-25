import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';
import { LogLevel, LearnCategory, LearnObject, } from '../../model';
import { HomeDefDetailService, LearnStorageService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'hih-learn-object-by-category',
  templateUrl: './object-by-category.component.html',
  styleUrls: ['./object-by-category.component.scss'],
})
export class ObjectByCategoryComponent implements OnInit, AfterViewInit {
  private _seledCategory: number;

  displayedColumns: string[] = ['id', 'category', 'name', 'comment'];
  dataSource: any = new MatTableDataSource<LearnObject>();

  @Input()
  set selectedCategory(selctgy: number) {
    if (selctgy !== this._seledCategory && selctgy) {
      this._seledCategory = selctgy;

      this.dataSource.data = [];

      // this._storageService.fetchAllObjects(this._seledCategory).subscribe((x: any) => {
      //   if (x instanceof Array && x.length > 0) {
      //     // let ardocitems: any[] = [];
      //     // for (let di of x) {
      //     //   let docitem: DocumentItemWithBalance = new DocumentItemWithBalance();
      //     //   docitem.onSetData(di);
      //     //   ardocitems.push(docitem);
      //     // }

      //     // this.dataSource.data = ardocitems;
      //   }
      // });
    }
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    public _homedefService: HomeDefDetailService,
    public _storageService: LearnStorageService,
    public _uiStatusService: UIStatusService) {
   }

   ngOnInit(): void {
     // Do nothing
   }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
}
