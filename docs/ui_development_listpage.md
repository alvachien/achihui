# List page

List page, plays the role that the entrance of the objects, for instance, the DocumentList page shows a table contains recent documents, and provides buttons to create/display/edit/delete document.

## JSON format for commuication with API

The JSON format:

```javascript 
{"contentList":[],"totalCount":0}
```

The two parts:

- *contentList*: the array of the returned objects (it may just part of the whole result if applying the paging concept);
- *totalCount*: the count of whole results.

There is a Typescript class defined for it:

```typescript
export class BaseListModel<T> {
  totalCount: number;
  contentList: T[];
}
```

## Theme

TBD.

## Using Material Table Component;

By default, the list page shall use the Material Table component;

### HTML code blocks

Add the HTML codes (DocumentList page as the example):

```html
    <mat-table #table [dataSource]="dataSource">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <mat-header-cell *matHeaderCellDef>#</mat-header-cell>
          <mat-cell *matCellDef="let row">
            <button mat-icon-button color="accent" (click)="onChangeDocument(row)" matTooltip="{{'Common.Edit' | translate}}">
                <mat-icon class="cell-icon">edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="onDeleteDocument(row)" matTooltip="{{'Common.Delete' | translate}}">
                <mat-icon class="cell-icon">delete</mat-icon>
            </button>
            {{row.Id}}
          </mat-cell>
        </ng-container>

        <!-- DocType Column -->
        <ng-container matColumnDef="DocType">
          <mat-header-cell *matHeaderCellDef>{{'Finance.DocumentType' | translate}}</mat-header-cell>
          <mat-cell *matCellDef="let row">
            {{ row.DocTypeName | translate }}
          </mat-cell>
        </ng-container>

        <!-- TranDate Column -->
        <ng-container matColumnDef="TranDate">
          <mat-header-cell *matHeaderCellDef>{{'Common.Date' | translate}}</mat-header-cell>
          <mat-cell *matCellDef="let row">
            {{ row.TranDateFormatString }}
          </mat-cell>
        </ng-container>

        <!-- TranAmount Column -->
        <ng-container matColumnDef="TranAmount">
          <mat-header-cell *matHeaderCellDef>{{'Finance.Amount' | translate}}</mat-header-cell>
          <mat-cell *matCellDef="let row">
            {{ row.TranAmount | currency: row.TranCurr }}
          </mat-cell>
        </ng-container>

        <!-- Desp Column -->
        <ng-container matColumnDef="Desp">
          <mat-header-cell *matHeaderCellDef>{{'Common.Description' | translate}}</mat-header-cell>
          <mat-cell *matCellDef="let row">
            {{ row.Desp }}
          </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;" (click)="onDisplayDocument(row)"></mat-row>
    </mat-table>
```

### CSS

Following is the CSS (within scss format):

```scss
.mat-table {
  overflow: auto;
}

.mat-cell, .mat-header-cell {
  overflow: hidden;
  word-wrap: break-word;
}

.mat-column-id {
  min-width: 120px;
  max-width: 200px;
}

.mat-column-DocType {
  min-width: 100px;
  max-width: 150px;
}

.mat-column-TranDate {
  min-width: 100px;
  max-width: 120px;
}

.mat-column-TranAmount {
  min-width: 100px;
  max-width: 200px;
}

.mat-column-Desp {
  min-width: 200px;
  max-width: 400px;
}
```

### Data Source

There are two ways to specify the data source:

1. Use the MaterialDataSource
2. Use the DataSource from CDK/Collections;

#### MaterialDataSource

First of all, you need import the following:

```typescript
import { MatTableDataSource } from '@angular/material';
```

Then, define the variable in the component (also use the DocumentList page as the example):

```typescript
dataSource: MatTableDataSource<Document> = new MatTableDataSource<Document>();
```

Next, to operator with the array, use the attribute:

```typescript
this.dataSource.data = []; // Empty the results
```

#### DataSource from CDK/Collection

First of all, you need import the following:

```typescript
import { DataSource } from '@angular/cdk/collections';
```

Then, you need create a data source class (Example for DocumentList):

```typescript
export class DocumentDataSource extends DataSource<any> {
   constructor(private _storageService: FinanceStorageService,
     private _paginator: MatPaginator) {
     super();
   }

   /** Connect function called by the table to retrieve one stream containing the data to render. */
   connect(): Observable<Document[]> {
     const displayDataChanges: any[] = [
       this._storageService.listDocumentChange,
       this._paginator.page,
     ];

     return merge(...displayDataChanges).pipe(map(() => {
       const data: any = this._storageService.Documents.slice();

       // Grab the page's slice of data.
       const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
       return data.splice(startIndex, this._paginator.pageSize);
     }));
   }

   disconnect(): void {
     // Empty
   }
}
```

Next, define the variable in component itself:

```typescript
dataSource: DocumentDataSource | undefined;
```

Initialize the variable in ngOnInit():

```typescript
   ngOnInit(): void {
        // Other codes...
        this.dataSource = new DocumentDataSource(this._storageService, this.paginator);
        // Other codes...
   }
```

### Displayed Columns

There shall be a variable defined in the component class for the displayed column:

```typescript
displayedColumns: string[] = ['id', 'DocType', 'TranDate', 'TranAmount', 'Desp'];
```

## Paging

Paging is the key requirement to improve the performance, not only the memory consumption but also the response time.

### Communication between API and UI

To supporting paging, the API shall provides the following parameters:

- *total*: the amount of returned records;
- *skip*: the amount that the returned records offset from the beginning;

### HTML code blocks

Add HTML codes to bring the paginator (normally the codeblock continues after the mat-table):

```html
  <mat-paginator #paginator 
    [length]="_storageService.Documents.length" 
    [pageIndex]="0" 
    [pageSize]="10" 
    [pageSizeOptions]="[5, 10, 25, 100]">
  </mat-paginator>
```

### MaterialPaginator component

By default, the list page shall use the MaterialPaginator component to support the paging;

First of all, import the class:

```typescript
import { MatPaginator } from '@angular/material';
```

Next, define the variable in the component class:

```typescript
@ViewChild(MatPaginator) paginator: MatPaginator;
```

### Communicated with Material Table component

The Paginator have to sync with Material Table component for the following scenarios:

1. Paginator triggers the events, like change the page;
2. Table triggers the events, like the refresh;

There are three ways to sync the events:

1. In the example above for DataSource from cdk/collection, the events of Paginator already embedded via a merge in the *connect()* method.

2. If using the MatDataSource, it can be easily achieved by assign the paginator instance to MatTable.

```typescript
  this.dataSource.paginator = this.paginator;
```

3. If using the MatDataSource, you can define an own *merge()* and define it in *ngAfterViewInit()*:

```typescript
  ngAfterViewInit(): void {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this._storageService!.fetchAllEvents(this.paginator.pageSize, this.paginator.pageIndex * this.paginator.pageSize);
        }),
        map((revdata: any) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.totalCountOfEvent = +revdata.totalCount;

          return revdata.contentList;
        }),
        catchError(() => {
          this.isLoadingResults = false;

          return of([]);
        }),
      ).subscribe((data: any) => {
        let rslts: GeneralEvent[] = [];
        if (data && data instanceof Array) {
          for (let ci of data) {
            let rst: GeneralEvent = new GeneralEvent();
            rst.onSetData(ci);

            rslts.push(rst);
          }
        }

        this.dataSource.data = rslts;
      });
  }
```

## Sort

By default, to support sort in list page, use the built-in sorting of Material Table component.

[Official linkage](https://material.angular.io/components/sort/overview).

The sorting consists of following parts:

- HTML

```html
<table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z8">

  <!-- Position Column -->
  <ng-container matColumnDef="position">
    <th mat-header-cell *matHeaderCellDef mat-sort-header> No. </th>
    <td mat-cell *matCellDef="let element"> {{element.position}} </td>
  </ng-container>

  <!-- Name Column -->
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
    <td mat-cell *matCellDef="let element"> {{element.name}} </td>
  </ng-container>

  <!-- Weight Column -->
  <ng-container matColumnDef="weight">
    <th mat-header-cell *matHeaderCellDef mat-sort-header> Weight </th>
    <td mat-cell *matCellDef="let element"> {{element.weight}} </td>
  </ng-container>

  <!-- Symbol Column -->
  <ng-container matColumnDef="symbol">
    <th mat-header-cell *matHeaderCellDef mat-sort-header> Symbol </th>
    <td mat-cell *matCellDef="let element"> {{element.symbol}} </td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>
```

- CSS

```css
table {
  width: 100%;
}

th.mat-sort-header-sorted {
  color: black;
}
```

- TS

```typescript
import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSort, MatTableDataSource} from '@angular/material';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
];

/**
 * @title Table with sorting
 */
@Component({
  selector: 'table-sorting-example',
  styleUrls: ['table-sorting-example.css'],
  templateUrl: 'table-sorting-example.html',
})
export class TableSortingExample implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }
}
```

## Filter
There is no official filter functionality in Material Table component, but use the Input for the searching.

Here comes an example:
- HTML
```html
<mat-form-field>
  <input matInput (keyup)="applyFilter($event.target.value)" placeholder="Filter">
</mat-form-field>

<table mat-table [dataSource]="dataSource" class="mat-elevation-z8">

  <!-- Position Column -->
  <ng-container matColumnDef="position">
    <th mat-header-cell *matHeaderCellDef> No. </th>
    <td mat-cell *matCellDef="let element"> {{element.position}} </td>
  </ng-container>

  <!-- Name Column -->
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef> Name </th>
    <td mat-cell *matCellDef="let element"> {{element.name}} </td>
  </ng-container>

  <!-- Weight Column -->
  <ng-container matColumnDef="weight">
    <th mat-header-cell *matHeaderCellDef> Weight </th>
    <td mat-cell *matCellDef="let element"> {{element.weight}} </td>
  </ng-container>

  <!-- Symbol Column -->
  <ng-container matColumnDef="symbol">
    <th mat-header-cell *matHeaderCellDef> Symbol </th>
    <td mat-cell *matCellDef="let element"> {{element.symbol}} </td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>
```

- CSS
```css
table {
  width: 100%;
}

.mat-form-field {
  font-size: 14px;
  width: 100%;
}
```

- TS
```typescript
import {Component} from '@angular/core';
import {MatTableDataSource} from '@angular/material';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
];

/**
 * @title Table with filtering
 */
@Component({
  selector: 'table-filtering-example',
  styleUrls: ['table-filtering-example.css'],
  templateUrl: 'table-filtering-example.html',
})
export class TableFilteringExample {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
```

### Selection table
Create a variable for SelectionModel which defined in cdk/collections:
```typescript
const initialSelection = [];
const allowMultiSelect = true;
this.selection = new SelectionModel<MyDataType>(allowMultiSelect, initialSelection);
```

Then, define a selection column:
```html
<ng-container matColumnDef="select">
  <th mat-header-cell *matHeaderCellDef>
    <mat-checkbox (change)="$event ? masterToggle() : null"
                  [checked]="selection.hasValue() && isAllSelected()"
                  [indeterminate]="selection.hasValue() && !isAllSelected()">
    </mat-checkbox>
  </th>
  <td mat-cell *matCellDef="let row">
    <mat-checkbox (click)="$event.stopPropagation()"
                  (change)="$event ? selection.toggle(row) : null"
                  [checked]="selection.isSelected(row)">
    </mat-checkbox>
  </td>
</ng-container>
```

Next, define functions:
```typescript
/** Whether the number of selected elements matches the total number of rows. */
isAllSelected() {
  const numSelected = this.selection.selected.length;
  const numRows = this.dataSource.data.length;
  return numSelected == numRows;
}

/** Selects all rows if they are not all selected; otherwise clear selection. */
masterToggle() {
  this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
}
```

Ensure the selection column is not hided:
```css
.mat-column-select {
  overflow: initial;
}
```

## Dynamic columns
To define a dynamic columns, following the code blocks below.

- HTML
```html
  <tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
  <tr mat-row *matRowDef="let row; columns: columnsToDisplay;"></tr>
```

- TS
```typescript
  displayedColumns: string[] = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  data: PeriodicElement[] = ELEMENT_DATA;

  addColumn() {
    const randomColumn = Math.floor(Math.random() * this.displayedColumns.length);
    this.columnsToDisplay.push(this.displayedColumns[randomColumn]);
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  shuffle() {
    let currentIndex = this.columnsToDisplay.length;
    while (0 !== currentIndex) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // Swap
      let temp = this.columnsToDisplay[currentIndex];
      this.columnsToDisplay[currentIndex] = this.columnsToDisplay[randomIndex];
      this.columnsToDisplay[randomIndex] = temp;
    }
  }
```

## Expandable row
To enable the expandable row, following the code blocks below.

- HTML
```html
<table mat-table
       [dataSource]="dataSource" multiTemplateDataRows
       class="mat-elevation-z8">
  <ng-container matColumnDef="{{column}}" *ngFor="let column of columnsToDisplay">
    <th mat-header-cell *matHeaderCellDef> {{column}} </th>
    <td mat-cell *matCellDef="let element"> {{element[column]}} </td>
  </ng-container>

  <!-- Expanded Content Column - The detail row is made up of this one column that spans across all columns -->
  <ng-container matColumnDef="expandedDetail">
    <td mat-cell *matCellDef="let element" [attr.colspan]="columnsToDisplay.length">
      <div class="example-element-detail"
           [@detailExpand]="element == expandedElement ? 'expanded' : 'collapsed'">
        <div class="example-element-diagram">
          <div class="example-element-position"> {{element.position}} </div>
          <div class="example-element-symbol"> {{element.symbol}} </div>
          <div class="example-element-name"> {{element.name}} </div>
          <div class="example-element-weight"> {{element.weight}} </div>
        </div>
        <div class="example-element-description">
          {{element.description}}
          <span class="example-element-description-attribution"> -- Wikipedia </span>
        </div>
      </div>
    </td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
  <tr mat-row *matRowDef="let element; columns: columnsToDisplay;"
      class="example-element-row"
      [class.example-expanded-row]="expandedElement === element"
      (click)="expandedElement = element">
  </tr>
  <tr mat-row *matRowDef="let row; columns: ['expandedDetail']" class="example-detail-row"></tr>
</table>
```

- TS
```typescript
import {Component} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

/**
 * @title Table with expandable rows
 */
@Component({
  selector: 'table-expandable-rows-example',
  styleUrls: ['table-expandable-rows-example.css'],
  templateUrl: 'table-expandable-rows-example.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TableExpandableRowsExample {
  dataSource = ELEMENT_DATA;
  columnsToDisplay = ['name', 'weight', 'symbol', 'position'];
  expandedElement: PeriodicElement;
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  description: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    name: 'Hydrogen',
    weight: 1.0079,
    symbol: 'H',
    description: `Hydrogen is a chemical element with symbol H and atomic number 1. With a standard
        atomic weight of 1.008, hydrogen is the lightest element on the periodic table.`
  }, {
    position: 2,
    name: 'Helium',
    weight: 4.0026,
    symbol: 'He',
    description: `Helium is a chemical element with symbol He and atomic number 2. It is a
        colorless, odorless, tasteless, non-toxic, inert, monatomic gas, the first in the noble gas
        group in the periodic table. Its boiling point is the lowest among all the elements.`
  },
];
```

- CSS
```css
table {
  width: 100%;
}

tr.example-detail-row {
  height: 0;
}

tr.example-element-row:not(.example-expanded-row):hover {
  background: #f5f5f5;
}

tr.example-element-row:not(.example-expanded-row):active {
  background: #efefef;
}

.example-element-row td {
  border-bottom-width: 0;
}

.example-element-detail {
  overflow: hidden;
  display: flex;
}

.example-element-diagram {
  min-width: 80px;
  border: 2px solid black;
  padding: 8px;
  font-weight: lighter;
  margin: 8px 0;
  height: 104px;
}

.example-element-symbol {
  font-weight: bold;
  font-size: 40px;
  line-height: normal;
}

.example-element-description {
  padding: 16px;
}

.example-element-description-attribution {
  opacity: 0.5;
}
```

## Footer row
Footer row can be added in HTML:
```html
<ng-container matColumnDef="cost">
  <th mat-header-cell *matHeaderCellDef> Cost </th>
  <td mat-cell *matCellDef="let data"> {{data.cost}} </td>
  <td mat-footer-cell *matFooterCellDef> {{totalCost}} </td>
</ng-container>

<tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
<tr mat-row *matRowDef="let myRowData; columns: columnsToDisplay"></tr>
<tr mat-footer-row *matFooterRowDef="columnsToDisplay"></tr>
```

## Sticky header and sticky footer
By using position: sticky styling, the table's rows and columns can be fixed so that they do not leave the viewport even when scrolled.
```html
<tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
<tr mat-footer-row *matFooterRowDef="displayedColumns; sticky: true"></tr>
```

## Entrance point for Create/Delete/Display;
There is no special logic for the entrace point for Create/Delete/Display but define seperate buttons for them.

## Splash screen;
The Splash screen actually achieved by following parts:
- TS
```typescript
  isLoadingResults: boolean;
```
- HTML
```html
<div class="app-loading-splash" *ngIf="isLoadingResults">
    <mat-spinner></mat-spinner>
</div>
```
- CSS
```css
.app-loading-splash {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 56px;
  right: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

Then, once you need the splash screen, toggle it via the variable *isLoadingResults*.

## Others
