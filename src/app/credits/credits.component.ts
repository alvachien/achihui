import { Component } from '@angular/core';
import { QuickSort } from 'actslib';

@Component({
  selector: 'hih-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss'],
})
export class CreditsComponent {
  creditApp: any[] = [
    {
      name: 'Angular 7+',
      url: 'https://angular.io',
    }, {
      name: 'TypeScript 3+',
      url: 'http://www.typescriptlang.org/',
    }, {
      name: 'Angular Material 7+',
      url: 'https://material.angular.io',
    }, {
      name: 'Ngx-translate',
      url: 'https://github.com/ngx-translate/core',
    }, {
      name: 'ECharts',
      url: 'http://echarts.baidu.com/',
    }, {
      name: 'fullcalendar',
      url: 'https://fullcalendar.io/',
    }, {
      name: 'TinyMCE',
      url: 'https://www.tinymce.com/',
    }, {
      name: 'Moment.js',
      url: 'https://momentjs.com/',
    }, {
      name: '.NET Core 2.1+',
      url: 'https://dot.net',
    },
  ];

  constructor() {
    // Empty
    QuickSort(this.creditApp, (a: any, b: any) => {
      if (!a.name) {
        if (!b.name) {
          return 0;
        } else {
          return -1;
        }
      } else {
        if (!b.name) {
          return 1;
        } else {
          return a.name.localeCompare(b.name);
        }
      }
    });
  }
}
