import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'hihapp-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private  _router: Router) {    
  }

  ngOnInit() {
  }

  public onBack2Home(): void {
    this._router.navigate(['/home']);
  }
}
