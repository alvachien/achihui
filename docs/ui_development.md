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

The detail page, however, show the detail information of one specified object only. It supports the CRU (D is covered in the list page):
- Create
- Read (Display)
- Update (Change)

There are also some utilities parts:
- Confirmation Dialog;
- Others?

## Utilities
Besides the pages listed above, there are several utility points need be highlighted:
- Events: Events are widely used to exchange information across components;
```typescript
import { EventEmitter } from '@angular/core';
// Define a variable
public operEvent = new EventEmitter<any>();
// Trigger an event
operEvent.emit(val);
```
- Dialog: To show a dialog, do the following:
```typescript
import { MatDialog } from '@angular/material';

const dlginfo: MessageDialogInfo = {
    Header: this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
    Content: x.toString(),
    Button: MessageDialogButtonEnum.onlyok,
};

this._dialog.open(MessageDialogComponent, {
    disableClose: false,
    width: '500px',
    data: dlginfo,
}).afterClosed().subscribe((x2: any) => {
    // Do nothing!
    if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering XXXComponent, afterClosed, Message dialog result ${x2}`);
    }
});
```

- Snackbar: To show a snackbar, do the following:
```typescript
import { MatSnackBar } from '@angular/material';
```

- Subscription (subscribe and unsubscribe): Exclude the 'http' related method, when you subscribe some Subject, you need unscribe it manually.
```typescript
private _eventStub: Subscription;

ngOnInit(): void {
    this._eventStub = someEvent.subscribe((x: any) => {
        // Do something
    });
}

ngOnDestroy(): void {
    if (this._eventStub) {
        this._eventStub.unsubscribe();
    }
}
```

There is one better solution for one-time reading logic:
```typescript
class myComponent { 
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1); 
  constructor(private serviceA: ServiceA, 
    private serviceB: ServiceB, 
    private serviceC: ServiceC) {
  } 
  ngOnInit() { 
    this.serviceA.pipe(takeUntil(this.destroyed$)).subscribe(...); 
    this.serviceB.pipe(takeUntil(this.destroyed$)).subscribe(...); 
    this.serviceC.pipe(takeUntil(this.destroyed$)).subscribe(...); 
  } 
  ngOnDestroy() { 
    this.destroyed$.next(true); this.destroyed$.complete(); 
  }
}
```

- Data Loading Animation: It's user friend design to show a data loading animation when the UI layer is communicating with API layer.

To achieve so, the following HTML part and codes are required:
```html
<div class="achih-dataloading-shade" *ngIf="isLoadingData">
    <mat-spinner></mat-spinner>
</div>
```

```css
.achih-dataloading-shade {
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

```typescript
public isLoadingData: boolean;

constructor() {
    this.isLoadingData = false;
}

ngOnInit() {
    this.isLoadingData = true;
    // DO data loading
    loadData.subscribe((x: any) => {
        this.isLoadingData = false;
    });
}
```
