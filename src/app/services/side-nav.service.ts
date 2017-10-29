import { Injectable } from '@angular/core';
import { SidenavItem } from '../model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class SideNavService {
  private _itemsSubject: BehaviorSubject<SidenavItem[]> = new BehaviorSubject<SidenavItem[]>([]);
  private _items: SidenavItem[] = [];
  items$: Observable<SidenavItem[]> = this._itemsSubject.asObservable();

  private _currentlyOpenSubject: BehaviorSubject<SidenavItem[]> = new BehaviorSubject<SidenavItem[]>([]);
  private _currentlyOpen: SidenavItem[] = [];
  currentlyOpen$: Observable<SidenavItem[]> = this._currentlyOpenSubject.asObservable();
  
  constructor() {
    const overall = this.addItem('Common.Overview', 'weekend', '/', 1);
    this.addSubItem(overall, 'Nav.InitialPage', '/initial', 1, 'dashboard');
    this.addSubItem(overall, 'Common.Languages', '/language', 2, 'language');
    this.addSubItem(overall, 'Nav.HomeList', '/homedef', 3, 'domain');
    this.addSubItem(overall, 'Finance.Currency', '/currency', 4, 'euro_symbol');

    const learn = this.addItem('Nav.LearningTrace', 'event_note', null, 2);
    this.addSubItem(learn, 'Learning.LearningCategory', '/learn/category', 1, 'settings_input_composite');
    this.addSubItem(learn, 'Learning.LearningObjects', '/learn/object', 2, 'lightbulb_outline');
    this.addSubItem(learn, 'Learning.LearningHistories', '/learn/history', 3, 'history');
    this.addSubItem(learn, 'Learning.QuestionBank', '/learn/questionbank', 4, 'collections');

    const finance = this.addItem('Nav.FinanceTrace', 'art_track', null, 3);
    this.addSubItem(finance, 'Common.Overview', '/finance/overview', 1, 'today');
    this.addSubItem(finance, 'Finance.AccountCategories', '/finance/acntctgy', 2, 'settings_input_component');
    this.addSubItem(finance, 'Finance.DocumentTypes', '/finance/doctype', 3, 'view_comfy');
    this.addSubItem(finance, 'Finance.TransactionTypes', '/finance/trantype', 4, 'featured_play_list');
    this.addSubItem(finance, 'Finance.AssetCategories', '/finance/assetctgy', 5, 'devices');
    this.addSubItem(finance, 'Finance.Accounts', '/finance/account', 6, 'library_books');
    this.addSubItem(finance, 'Finance.ControlCenters', '/finance/controlcenter', 7, 'store');
    this.addSubItem(finance, 'Finance.Orders', '/finance/order', 8, 'tune');
    this.addSubItem(finance, 'Finance.Documents', '/finance/document', 9, 'poll');
    this.addSubItem(finance, 'Finance.Reports', '/finance/report', 10, 'account_balance');

    const library = this.addItem('Nav.Libraries', 'subject', null, 4);
    this.addSubItem(library, 'Nav.Person', '/library/person', 1, 'face');
    this.addSubItem(library, 'Nav.Location', '/library/location', 2, 'storage');
    this.addSubItem(library, 'Library.BookCategories', '/library/bookcategory', 3, 'settings');
    this.addSubItem(library, 'Library.Books', '/library/book', 4, 'book');
    this.addSubItem(library, 'Library.MovieGenres', '/library/moviegenre', 5, 'video_library');
    this.addSubItem(library, 'Library.Movies', '/library/movie', 6, 'movie');

    const event = this.addItem('Nav.EventTrace', 'event', null, 5);
    this.addSubItem(event, 'Common.Categories', '/event/category', 1, 'toc');
    this.addSubItem(event, 'Nav.EventTrace', '/event/recurevent', 2, 'schedule');
    this.addSubItem(event, 'Nav.EventTrace', '/event/timeline', 2, 'timeline');
  }

  addItem(name: string, icon: string, route: any, position: number, badge?: string, badgeColor?: string, customClass?: string, color?: string) {
    const item = new SidenavItem({
      name: name,
      icon: icon,
      route: route,
      subItems: [],
      position: position || 99,
      badge: badge || null,
      badgeColor: badgeColor || null,
      customClass: customClass || null,
      color: color || 'primary'
    });

    this._items.push(item);
    this._itemsSubject.next(this._items);

    return item;
  }

  addSubItem(parent: SidenavItem, name: string, route: any, position: number, icon?: string, color?: string) {
    const item = new SidenavItem({
      name: name,
      route: route,
      parent: parent,
      subItems: [],
      position: position || 99,
      icon: icon || null,
      color: color || 'accent'
    });

    parent.subItems.push(item);
    this._itemsSubject.next(this._items);

    return item;
  }

  removeItem(item: SidenavItem) {
    let index = this._items.indexOf(item);
    if (index > -1) {
      this._items.splice(index, 1);
    }

    this._itemsSubject.next(this._items);
  }

  isOpen(item: SidenavItem) {
    return (this._currentlyOpen.indexOf(item) != -1);
  }

  toggleCurrentlyOpen(item: SidenavItem) {
    let currentlyOpen = this._currentlyOpen;
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

  getAllParents(item: SidenavItem, currentlyOpen: SidenavItem[] = []) {
    currentlyOpen.unshift(item);

    if (item.hasParent()) {
      return this.getAllParents(item.parent, currentlyOpen);
    } else {
      return currentlyOpen;
    }
  }

  nextCurrentlyOpen(currentlyOpen: SidenavItem[]) {
    this._currentlyOpen = currentlyOpen;
    this._currentlyOpenSubject.next(currentlyOpen);
  }

  nextCurrentlyOpenByRoute(route: string) {
    let currentlyOpen = [];

    let item = this.findByRouteRecursive(route, this._items);
  }

  findByRouteRecursive(route: string, collection: SidenavItem[]) {
    let result = collection.filter((item)=> {
      if(item.route === route) {
        return item;
      }
    });


    if (!result) {
      collection.forEach((item)=> {
        if (item.hasSubItems()) {
          let found = this.findByRouteRecursive(route, item.subItems);

          if (found) {
            result = found;
            return false;
          }
        }
      });
    }

    return result;
  }

  get currentlyOpen() {
    return this._currentlyOpen;
  }

  getSidenavItemByRoute(route) {
    return this.findByRouteRecursive(route, this._items);
  }  
}
