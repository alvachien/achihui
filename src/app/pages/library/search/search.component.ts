import { Component } from '@angular/core';

import { ModelUtility, ConsoleLogTypeEnum } from '../../../model';
import { HomeDefOdataService, LibraryStorageService } from '../../../services';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'hih-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.less'],
    imports: [
      NzResultModule,
      NzButtonModule,
      TranslocoModule,
    ]
})
export class SearchComponent {
  constructor(private storageService: LibraryStorageService, private homeService: HomeDefOdataService) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering SearchComponent constructor...',
      ConsoleLogTypeEnum.debug
    );
  }
}
