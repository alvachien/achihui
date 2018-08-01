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
- Events
```typescript
import { EventEmitter } from '@angular/core';
// Define a variable
public operEvent = new EventEmitter<any>();
// Trigger an event
operEvent.emit(val);
```
- Dialog
To show a dialog, do the following:
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
        console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
    }
});
```

- Snackbar
To show a snackbar, do the following:
```typescript
import { MatSnackBar } from '@angular/material';
```
