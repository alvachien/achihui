# UI Development
## Overview
There are two kinds of page of the UI development of H.I.H.:
- List page
- Detail page

The list page provides the an overview, shows the list of the objects (the objects only show simple data). Normally it supports:
- Paging;
- Sort;
- Filter;
- Entrance for Create/Delete

The detail page, however, show the detail information of one specified object only.It supports the CRU (D is covered in the list page):
- Create
- Read (Display)
- Update (Change)

## List page
For list page, there are actually two parts of information returned from Web API to UI. The first part is the total count, and second part is the just the current set.

The JSON format: ``` {"contentList":[],"totalCount":0} ```
- contentList: the real data;
- totalCount: the count of real data.

### Detail page
Due to the complexity of the Detail page, provide a solid interface upon the Detail page will make the development much easier.

#### Constants
Enum UIMode has been defined as following:

```export enum UIMode { Create = 1, Change = 2, Display = 3, Invalid = 9 };```

There are two utility functions have been defined as well:

```
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

#### Interface
The interface IUIDetailPage defined as following:

``` 
export declare abstract class IUIDetailPage { 
    public IsUIEditable(): boolean; 
    public currentUIMode(): UIMode; 
    public currentUIModeString(): string; 
}
```

#### Example of implementation
Finance Control Center detail page implements the interface IUIDetailPage.

It defines the attributes:
```
private routerID: number; // Current ID in routing 
public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;
```
And the methods: 
```
IsUIEditable() { return HIHCommon.isUIEditable(this.currentUIMode()); } 
currentUIMode() { return this.uiMode; } 
currentUIModeString() { return HIHCommon.getUIModeString(this.currentUIMode()); }
```
