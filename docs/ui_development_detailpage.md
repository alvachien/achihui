# Detail page
Due to the complexity of the Detail page, provide a solid interface upon the Detail page will make the development much easier.

## Constants
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

## Interface
The interface IUIDetailPage defined as following:

```typescript
export declare abstract class IUIDetailPage { 
    public IsUIEditable(): boolean; 
    public currentUIMode(): UIMode; 
    public currentUIModeString(): string; 
}
```

## Example of implementation
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

## Distinguish the mode from URL
As there is only one component served for three modes, it shall be differented when parsing the URLS.

```typescript
import { Router, ActivatedRoute } from '@angular/router';

// Import the ActivatedRouter in constructor of component class
  constructor(
    private _router: Router,
    private _activateRoute: ActivatedRoute) {
  }

// Parse the URL in the ngOnInit
  ngOnInit(): void {
    this._activateRoute.url.subscribe((x: any) => {
      if (x instanceof Array && x.length > 0) {
        // The path can be different for different component
        if (x[0].path === 'create') {
          // CREATE mode
        } else if (x[0].path === 'edit') {
          // EDIT mode
        } else if (x[0].path === 'display') {
          // DISPLAY mode
        }
      }
    // Other codes...
  }
```
