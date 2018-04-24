import { Injectable } from '@angular/core';
import { SidenavItem } from '../model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class SideNavService {
  private _itemsSubject: BehaviorSubject<SidenavItem[]> = new BehaviorSubject<SidenavItem[]>([]);
  private _items: SidenavItem[] = [];
  private _currentlyOpenSubject: BehaviorSubject<SidenavItem[]> = new BehaviorSubject<SidenavItem[]>([]);
  private _currentlyOpen: SidenavItem[] = [];

  items$: Observable<SidenavItem[]> = this._itemsSubject.asObservable();
  currentlyOpen$: Observable<SidenavItem[]> = this._currentlyOpenSubject.asObservable();

  constructor() {
    const overall: any = this.addItem('Common.Overview', 'weekend', '/', 1);
    this.addSubItem(overall, 'Nav.InitialPage', '/initial', 1, 'dashboard');
    this.addSubItem(overall, 'Common.Languages', '/language', 2, 'language');
    this.addSubItem(overall, 'Nav.HomeList', '/homedef', 3, 'domain');
    this.addSubItem(overall, 'Finance.Currency', '/currency', 4, 'euro_symbol');
    this.addSubItem(overall, 'Common.Tags', '/tag', 5, 'filter_vintage');

    const learn: any = this.addItem('Nav.LearningTrace', 'event_note', undefined, 2);
    this.addSubItem(learn, 'Learning.LearningCategory', '/learn/category', 1, 'settings_input_composite');
    this.addSubItem(learn, 'Learning.LearningObjects', '/learn/object', 2, 'lightbulb_outline');
    this.addSubItem(learn, 'Learning.LearningHistories', '/learn/history', 3, 'history');
    this.addSubItem(learn, 'Learning.QuestionBank', '/learn/questionbank', 4, 'collections');
    this.addSubItem(learn, 'Learning.EnglishWord', '/learn/enword', 5, 'text_fields');
    this.addSubItem(learn, 'Learning.EnglishSentence', '/learn/ensent', 6, 'short_text');

    const finance: any = this.addItem('Nav.FinanceTrace', 'art_track', undefined, 3);
    this.addSubItem(finance, 'Common.Overview', '/finance/overview', 1, 'today');
    this.addSubItem(finance, 'Finance.AccountCategories', '/finance/acntctgy', 2, 'settings_input_component');
    this.addSubItem(finance, 'Finance.DocumentTypes', '/finance/doctype', 3, 'view_comfy');
    this.addSubItem(finance, 'Finance.TransactionTypes', '/finance/trantype', 4, 'featured_play_list');
    this.addSubItem(finance, 'Finance.AssetCategories', '/finance/assetctgy', 5, 'devices');
    this.addSubItem(finance, 'Finance.Accounts', '/finance/account/tree', 6, 'library_books');
    // this.addSubItem(finance, 'Finance.Accounts', '/finance/account/tree', 7, 'directions');
    this.addSubItem(finance, 'Finance.ControlCenters', '/finance/controlcenter', 8, 'store');
    this.addSubItem(finance, 'Finance.Orders', '/finance/order', 9, 'tune');
    this.addSubItem(finance, 'Finance.Documents', '/finance/document', 10, 'assignment');
    this.addSubItem(finance, 'Finance.Reports', '/finance/report', 11, 'account_balance');

    const library: any = this.addItem('Nav.Libraries', 'subject', undefined, 4);
    this.addSubItem(library, 'Nav.Person', '/library/person', 1, 'face');
    this.addSubItem(library, 'Nav.Location', '/library/location', 2, 'storage');
    this.addSubItem(library, 'Library.BookCategories', '/library/bookcategory', 3, 'settings');
    this.addSubItem(library, 'Library.Books', '/library/book', 4, 'book');
    this.addSubItem(library, 'Library.MovieGenres', '/library/moviegenre', 5, 'video_library');
    this.addSubItem(library, 'Library.Movies', '/library/movie', 6, 'movie');

    const event: any = this.addItem('Nav.EventTrace', 'event', undefined, 5);
    this.addSubItem(event, 'Common.Categories', '/event/category', 1, 'toc');
    this.addSubItem(event, 'Common.Events', '/event/general', 2, 'schedule');
    this.addSubItem(event, 'Common.RecurEvents', '/event/recur', 3, 'repeat');
    this.addSubItem(event, 'Common.HabitEvents', '/event/habit', 4, 'restore_page');
    this.addSubItem(event, 'Common.EventsByTimeline', '/event/timeline', 5, 'timeline');

    const about: any = this.addItem('Nav.About', 'help', undefined, 6);
    this.addSubItem(about, 'Nav.About', '/about', 1, 'help');
    this.addSubItem(about, 'Nav.Credits', '/credits', 2, 'thumb_up');
    this.addSubItem(about, 'Nav.Version', '/version', 3, 'update');
  }

  addItem(name: string, icon: string, route: any, position: number, badge?: string,
    badgeColor?: string, customClass?: string, color?: string): SidenavItem {
    const item: SidenavItem = new SidenavItem({
      name: name,
      icon: icon,
      route: route,
      subItems: [],
      position: position || 99,
      badge: badge || undefined,
      badgeColor: badgeColor || undefined,
      customClass: customClass || undefined,
      color: color || 'primary',
    });

    this._items.push(item);
    this._itemsSubject.next(this._items);

    return item;
  }

  addSubItem(parent: SidenavItem, name: string, route: any, position: number, icon?: string, color?: string): SidenavItem {
    const item: SidenavItem = new SidenavItem({
      name: name,
      route: route,
      parent: parent,
      subItems: [],
      position: position || 99,
      icon: icon || undefined,
      color: color || 'accent',
    });

    parent.subItems.push(item);
    this._itemsSubject.next(this._items);

    return item;
  }

  removeItem(item: SidenavItem): void {
    let index: number = this._items.indexOf(item);
    if (index > -1) {
      this._items.splice(index, 1);
    }

    this._itemsSubject.next(this._items);
  }

  isOpen(item: SidenavItem): boolean {
    return (this._currentlyOpen.indexOf(item) !== -1);
  }

  toggleCurrentlyOpen(item: SidenavItem): void {
    let currentlyOpen: any = this._currentlyOpen;
    if (this.isOpen(item)) {
      if (currentlyOpen.length > 1) {
        currentlyOpen.length = this._currentlyOpen.indexOf(item);
      } else {
        currentlyOpen = [];
      }
    } else {
      currentlyOpen = this.getAllParents(item);
    }

    this._currentlyOpen = currentlyOpen;
    this._currentlyOpenSubject.next(currentlyOpen);
  }

  getAllParents(item: SidenavItem, currentlyOpen: SidenavItem[] = []): any {
    currentlyOpen.unshift(item);

    if (item.hasParent()) {
      return this.getAllParents(item.parent, currentlyOpen);
    } else {
      return currentlyOpen;
    }
  }

  nextCurrentlyOpen(currentlyOpen: SidenavItem[]): void {
    this._currentlyOpen = currentlyOpen;
    this._currentlyOpenSubject.next(currentlyOpen);
  }

  nextCurrentlyOpenByRoute(route: string): void {
    let currentlyOpen: any[] = [];

    let item: any = this.findByRouteRecursive(route, this._items);
  }

  findByRouteRecursive(route: string, collection: SidenavItem[]): any {
    let result: any = collection.filter((item: any) => {
      if (item.route === route) {
        return item;
      }
    });

    if (!result) {
      collection.forEach((item: any) => {
        if (item.hasSubItems()) {
          let found: any = this.findByRouteRecursive(route, item.subItems);

          if (found) {
            result = found;
            return false;
          }
        }
      });
    }

    return result;
  }

  get currentlyOpen(): any {
    return this._currentlyOpen;
  }

  getSidenavItemByRoute(route: any): any {
    return this.findByRouteRecursive(route, this._items);
  }
}
