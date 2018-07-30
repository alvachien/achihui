# UI Development
This page summarize some common parts inside UI development.

## Overview
There are three kinds of page in the UI development of whole H.I.H. project:
- List page
- Hierarchy page
- Detail page

The list page provides the an overview, shows the list of the objects (the objects only show simple data). Normally it supports:
- Paging;
- Sort;
- Filter;
- Entrance point for Create/Delete/Display;
- Splash screen;

The detail page, however, show the detail information of one specified object only.It supports the CRU (D is covered in the list page):
- Create
- Read (Display)
- Update (Change)

There are also some utilities parts:
- Confirmation Dialog;
- Others?

## List page
List page, plays the role that the entrance of the objects, for instance, the DocumentList page shows a table contains recent documents, and provides buttons to create/display/edit/delete document.

### JSON format for commuication with API
The JSON format: 
```javascript 
{"contentList":[],"totalCount":0} 
```

The two parts:
- *contentList*: the array of the returned objects (it may just part of the whole result if applying the paging concept);
- *totalCount*: the count of whole results.

### Using Material Table Component;
By default, the list page shall use the Material Table component;

#### HTML code blocks
Add the HTML codes (DocumentList page as the example):

```html
    <mat-table #table [dataSource]="dataSource">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <mat-header-cell *matHeaderCellDef>#</mat-header-cell>
          <mat-cell *matCellDef="let row">
            <button mat-icon-button color="accent" (click)="onChangeDocument(row)" matTooltip="{{'Common.Edit' | translate}}"><mat-icon class="cell-icon">edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="onDeleteDocument(row)" matTooltip="{{'Common.Delete' | translate}}"><mat-icon class="cell-icon">delete</mat-icon></button>
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

#### CSS
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

.mat-cell:nth-child(1),
.mat-header-cell:nth-child(1),
{
  flex: 0 0 15%;
}

.mat-row:hover {
  background-color: #ffff99;
  cursor: pointer;
}

.mat-row:nth-child(even) {
  background-color: lightgoldenrodyellow;
}

.mat-row:nth-child(odd) {
  background-color: white;
}
```

#### Data Source
There are two ways to specify the data source:
1. Use the MaterialDataSource
2. Use the DataSource from CDK/Collections;

##### MaterialDataSource
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

##### DataSource from CDK/Collection
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

#### Displayed Columns
There shall be a variable defined in the component class for the displayed column:
```typescript
displayedColumns: string[] = ['id', 'DocType', 'TranDate', 'TranAmount', 'Desp'];
```

### Paging
Paging is the key requirement to improve the performance, not only the memory consumption but also the response time.

#### Communication between API and UI
To supporting paging, the API shall provides the following parameters:
- *total*: the amount of returned records;
- *skip*: the amount that the returned records offset from the beginning;

#### HTML code blocks
Add HTML codes to bring the paginator (normally the codeblock continues after the mat-table):

```html
      <mat-paginator #paginator 
        [length]="_storageService.Documents.length" 
        [pageIndex]="0" 
        [pageSize]="10" 
        [pageSizeOptions]="[5, 10, 25, 100]">
      </mat-paginator>
```

#### MaterialPaginator component
By default, the list page shall use the MaterialPaginator component to support the paging;

First of all, import the class:
```typescript
import { MatPaginator } from '@angular/material';
```

Next, define the variable in the component class:
```typescript
@ViewChild(MatPaginator) paginator: MatPaginator;
```

#### Communicated with Material Table component
The Paginator have to sync with Material Table component for the following scenarios:
1. Paginator has been selected for one specific page;
2. Paginator has been updated 


### Others

## Hierarchy page
The hierarchy page, shows a hierarchy for the selected objects;

### JSON format
The JSON format for hierarchy page is slightly difference with the one for list page. 

### Using Material Tree Component
By default, the hierarchy page uses the Material Tree Component;

## Detail page
Due to the complexity of the Detail page, provide a solid interface upon the Detail page will make the development much easier.

### Constants
Enum UIMode has been defined as following:

```typescript
export enum UIMode { Create = 1, Change = 2, Display = 3, Invalid = 9 };
```

There are two utility functions have been defined as well:

```typescript
export function isUIEditable(mode: UIMode): boolean { 
    return mode === UIMode.Create || mode === UIMode.Change; 
}

export function getUIModeString(mode: UIMode): string { switch(mode) { 
    case UIMode.Create: return "Common.Create";

    case UIMode.Change:
        return "Common.Change";

    case UIMode.Display:
        return "Common.Display";

    default:
        return "";
    }
}
```

### Interface
The interface IUIDetailPage defined as following:

```typescript
export declare abstract class IUIDetailPage { 
    public IsUIEditable(): boolean; 
    public currentUIMode(): UIMode; 
    public currentUIModeString(): string; 
}
```

### Example of implementation
Finance Control Center detail page implements the interface IUIDetailPage.

It defines the attributes:
```typescript
private routerID: number; // Current ID in routing 
public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;
```

And the methods: 
```typescript
IsUIEditable() { return HIHCommon.isUIEditable(this.currentUIMode()); } 
currentUIMode() { return this.uiMode; } 
currentUIModeString() { return HIHCommon.getUIModeString(this.currentUIMode()); }
```
