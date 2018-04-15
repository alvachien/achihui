import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'achih-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  public currVersion: string;

  constructor() {
    this.currVersion = environment.CurrentVersion;
  }

  ngOnInit(): void {
    // Do nothing
  }
}
