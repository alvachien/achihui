import { Component } from '@angular/core';
import { en_US, NzI18nService } from 'ng-zorro-antd';

@Component({
  selector: 'hih-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  isCollapsed = false;
  searchContent: string;

  constructor(private i18n: NzI18nService) { }

  switchLanguage() {
    this.i18n.setLocale(en_US);
  }
  searchFocus() {

  }
  searchBlur() {
    
  }
}
