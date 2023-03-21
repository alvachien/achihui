import { Component } from '@angular/core';

import { ModelUtility, ConsoleLogTypeEnum } from '../../../model';
import { HomeDefOdataService, LibraryStorageService } from '../../../services';

@Component({
  selector: 'hih-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less'],
})
export class SearchComponent {
  constructor(private storageService: LibraryStorageService, private homeService: HomeDefOdataService) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering SearchComponent constructor...',
      ConsoleLogTypeEnum.debug
    );
  }
}
