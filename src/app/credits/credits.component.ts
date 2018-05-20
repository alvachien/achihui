import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hih-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss'],
})
export class CreditsComponent implements OnInit {
  creditApp: any[] = [
    {
      name: 'Angular 6',
      url: 'https://angular.io',
    }, {
      name: 'TypeScript 2+',
      url: 'http://www.typescriptlang.org/',
    }, {
      name: 'Angular Material 6',
      url: 'https://material.angular.io',
    }, {
      name: 'Ngx-translate',
      url: 'https://github.com/ngx-translate/core',
    }, {
      name: 'Ngx-Charts',
      url: 'https://github.com/swimlane/ngx-charts',
    }, {
      name: 'TinyMCE',
      url: 'https://www.tinymce.com/',
    }, {
      name: 'Moment.js',
      url: 'https://momentjs.com/',
    }, {
      name: '.NET Core',
      url: 'https://dot.net',
    },
  ];
  constructor() {
    // Empty
   }

  ngOnInit(): void {
    // Empty
  }
}
