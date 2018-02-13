import { Component, OnInit, Inject, Input, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SidenavItem } from '../model';
import { SideNavService } from '../services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'hih-sidenav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss', ],
})
export class SideNavComponent implements OnInit, OnDestroy {

  private _itemsSubscription: Subscription;
  private _routerEventsSubscription: Subscription;
  items: SidenavItem[] = [];

  constructor(private _service: SideNavService,
    private _router: Router) {
  }

  ngOnInit(): void {
    this._itemsSubscription = this._service.items$.subscribe((items: SidenavItem[]) => {
      this.items = this.sortRecursive(items, 'position');
    });

    this._routerEventsSubscription = this._router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this._service.nextCurrentlyOpenByRoute(event.url);
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 400);
      }
    });
  }

  public toggleIconSidenav(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  sortRecursive(array: SidenavItem[], propertyName: string): SidenavItem[] {
    return array;
  }

  ngOnDestroy(): void {
    this._itemsSubscription.unsubscribe();
    this._routerEventsSubscription.unsubscribe();
  }
}
