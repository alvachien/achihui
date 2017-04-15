import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.css']
})
export class PagenotfoundComponent implements OnInit {

  constructor(private  _router: Router) {    
  }

  ngOnInit() {
  }
  
  public onBack2Home(): void {
    this._router.navigate(['/home']);
  }
}
