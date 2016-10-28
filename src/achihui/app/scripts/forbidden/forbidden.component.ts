import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'forbidden',
    template: `<div class="alert alert-danger" role="alert">
        <strong> Oh snap!</strong> It's a forbidden area where you need login first.
        <br />
        Please register yourself first via the 'Login' link in header area.
        <br />
        Or contact me: 
        <address>
            Alva Chien (<a href= "mailto:alvachien@live.com"> email </a>, <a href="http://www.flickr.com/photos/alvachien">Flickr</a>, etc)
        </address>.
        </div>`
})

export class ForbiddenComponent implements OnInit {

    public message: string;
    public values: any[];

    constructor() {
        this.message = "ForbiddenComponent constructor";
    }

    ngOnInit() {
    }
}