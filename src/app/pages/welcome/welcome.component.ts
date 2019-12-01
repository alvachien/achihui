import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hih-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
})
export class WelcomeComponent implements OnInit {
  array = [1, 2, 3, 4];

  constructor() { }

  ngOnInit() {
  }
}
