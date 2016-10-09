import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'my-app-about',
    templateUrl: 'app/views/about.html'
})
export class AboutComponent implements OnInit {
    title = 'About';

    constructor() {
    }

    ngOnInit() {
    }

}