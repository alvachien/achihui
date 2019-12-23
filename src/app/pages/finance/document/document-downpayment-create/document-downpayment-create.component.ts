import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hih-document-downpayment-create',
  templateUrl: './document-downpayment-create.component.html',
  styleUrls: ['./document-downpayment-create.component.less']
})
export class DocumentDownpaymentCreateComponent implements OnInit {

  current = 0;

  index = 'First-content';

  pre(): void {
    this.current -= 1;
    this.changeContent();
  }

  next(): void {
    this.current += 1;
    this.changeContent();
  }

  done(): void {
    console.log('done');
  }

  changeContent(): void {
    switch (this.current) {
      case 0: {
        this.index = 'First-content';
        break;
      }
      case 1: {
        this.index = 'Second-content';
        break;
      }
      case 2: {
        this.index = 'third-content';
        break;
      }
      default: {
        this.index = 'error';
      }
    }
  }

  constructor() {}

  ngOnInit() {
  }
}
