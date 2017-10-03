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
    const overall = this.addItem('Common.Overview', 'home', '/', 1);
    this.addSubItem(overall, 'Nav.Home', '/', 1);
    this.addSubItem(overall, 'Common.Languages', '/language', 1);
    this.addSubItem(overall, 'Nav.HomeList', '/homedef', 2);
    this.addSubItem(overall, 'Finance.Currency', '/currency', 2);

    const learn = this.addItem('Nav.LearningTrace', 'bubble_chart', null, 3);
    this.addSubItem(learn, 'Learning.LearningCategory', '/learn/category', 1);
    this.addSubItem(learn, 'Learning.LearningObjects', '/learn/object', 2);
    this.addSubItem(learn, 'Learning.LearningHistories', '/learn/history', 3);

    const finance = this.addItem('Nav.FinanceTrace', 'equalizer', null, 3);
    this.addSubItem(finance, 'Common.Overview', '/finance/overview', 1);
    this.addSubItem(finance, 'Finance.AccountCategories', '/finance/acntctgy', 2);
    this.addSubItem(finance, 'Finance.DocumentTypes', '/finance/doctype', 3);
    this.addSubItem(finance, 'Finance.TransactionTypes', '/finance/trantype', 4);
    this.addSubItem(finance, 'Finance.Accounts', '/finance/account', 5);
    this.addSubItem(finance, 'Finance.ControlCenters', '/finance/controlcenter', 6);
    this.addSubItem(finance, 'Finance.Orders', '/finance/order', 7);
    this.addSubItem(finance, 'Finance.Documents', '/finance/document', 8);
    this.addSubItem(finance, 'Finance.Reports', '/finance/report', 9);
  }

  addItem(name: string, icon: string, route: any, position: number, badge?: string, badgeColor?: string, customClass?: string) {
    const item = new SidenavItem({
      name: name,
      icon: icon,
      route: route,
      subItems: [],
      position: position || 99,
      badge: badge || null,
      badgeColor: badgeColor || null,
      customClass: customClass || null
    });

    this._items.push(item);
    this._itemsSubject.next(this._items);

    return item;
  }

  addSubItem(parent: SidenavItem, name: string, route: any, position: number) {
    const item = new SidenavItem({
      name: name,
      route: route,
      parent: parent,
      subItems: [],
      position: position || 99
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
