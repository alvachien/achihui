import { Component, OnInit } from '@angular/core';
import { GeneralFilterOperatorEnum, GeneralFilterItem, UIDisplayString, UIDisplayStringUtil } from '../../model';

@Component({
  selector: 'hih-fin-document-item-search-list',
  templateUrl: './document-item-search-list.component.html',
  styleUrls: ['./document-item-search-list.component.scss'],
})
export class DocumentItemSearchListComponent implements OnInit {
  filters: GeneralFilterItem[] = [];
  allOperators: UIDisplayString[] = [];
  allFields: any[] = [];
  filterEditable: boolean = true;

  constructor() {
    this.allOperators = UIDisplayStringUtil.getGeneralFilterOperatorDisplayStrings();
    this.allFields = [{
      displayas: '',
      value: '',
    }, {
      displayas: '',
      value: '',
    },
    ];
  }

  ngOnInit(): void {
    this.onAddFilter();
  }

  public onAddFilter(): void {
    this.filters.push(new GeneralFilterItem());
  }
  public onRemoveFilter(idx: number): void {
    this.filters.splice(idx, 1);
  }
  public onSearch(): void {
    // Do the real search
  }
}
