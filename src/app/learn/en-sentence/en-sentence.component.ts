import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'hih-learn-en-sentence',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./en-sentence.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EnSentenceComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
