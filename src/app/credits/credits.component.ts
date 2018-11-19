import { Component } from '@angular/core';

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
   }
}
