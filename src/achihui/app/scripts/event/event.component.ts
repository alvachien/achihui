import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'my-app-about',
    templateUrl: 'app/views/event/event.html'
})

export class EventComponent implements OnInit {
    title = 'About';

    constructor() {
    }

    ngOnInit() {
    }
}