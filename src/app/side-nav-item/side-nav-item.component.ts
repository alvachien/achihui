import { Component, OnInit, HostBinding, Input } from '@angular/core';
import { SidenavItem } from '../model';
import { SideNavService } from '../services';

@Component({
  selector: 'hih-sidenav-item',
  templateUrl: './side-nav-item.component.html',
  styleUrls: ['./side-nav-item.component.scss']
})
export class SideNavItemComponent implements OnInit {

  @Input() item: SidenavItem;

  @HostBinding('class.open')
  get isOpen() {
    return this._service.isOpen(this.item);
  }

  constructor(private _service: SideNavService) {
  }

  ngOnInit() {
  }

  toggleDropdown(): void {
    if (this.item.hasSubItems()) {
      this._service.toggleCurrentlyOpen(this.item);
    }
  }

  getSubItemsHeight() {
    if (this.item.hasSubItems()) {
      return (this.getOpenSubItemsCount(this.item) * 45) + 'px';
    }
  }

  getOpenSubItemsCount(item: SidenavItem): number {
    let count = 0;
    if (item.hasSubItems() && this._service.isOpen(item)) {
      count += item.subItems.length;
      item.subItems.forEach((subItem) => {
        count += this.getOpenSubItemsCount(subItem);
      })
    }

    return count;
  }
}
