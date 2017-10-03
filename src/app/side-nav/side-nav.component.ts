import { Component, OnInit, Inject, Input, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SidenavItem } from '../model';
import { SideNavService } from '../services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'hih-sidenav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit, OnDestroy {

  items: SidenavItem[] = [];
  private _itemsSubscription: Subscription;
  private _routerEventsSubscription: Subscription;

  constructor(private _service: SideNavService,
    private _router: Router) {
  }

  ngOnInit() {
    this._itemsSubscription = this._service.items$.subscribe((items: SidenavItem[]) => {
      this.items = this.sortRecursive(items, 'position');
    });

    this._routerEventsSubscription = this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._service.nextCurrentlyOpenByRoute(event.url);
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 400);
      }
    });
  }

  toggleIconSidenav() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);

    //this._service.isIconSidenav = !this._service.isIconSidenav;
  }

  // isIconSidenav(): boolean {
  //   return this._service.isIconSidenav;
  // }

  sortRecursive(array: SidenavItem[], propertyName: string) {
    return array;
  };

  ngOnDestroy() {
    this._itemsSubscription.unsubscribe();
    this._routerEventsSubscription.unsubscribe();
  }
}
